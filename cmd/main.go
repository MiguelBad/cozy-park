package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

const XCenter = 2200
const YCenter = 1300

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(req *http.Request) bool { return true },
	}

	playerStateBroadcast = make(chan *Player)
	clientInfoBroadcast  = make(chan *ClientConnectionPayload)
	playerList           = make(map[*Player]bool)

	mu sync.Mutex
)

type Player struct {
	conn  *websocket.Conn
	id    string
	state *State
}

type State struct {
	Color       string `json:"color"`
	Action      string `json:"action"`
	Target      string `json:"target"`
	X           int    `json:"x"`
	Y           int    `json:"y"`
	Frame       int    `json:"frame"`
	ChangeFrame bool   `json:"changeFrame"`
	Facing      string `json:"facing"`
}

type StateMessage struct {
	Type string   `json:"type"`
	Data *Message `json:"data"`
}

type Message struct {
	Color       string `json:"color"`
	X           int    `json:"x"`
	Y           int    `json:"y"`
	Facing      string `json:"facing"`
	Frame       int    `json:"frame"`
	ChangeFrame bool   `json:"changeFrame"`
}

type ClientConnectionPayload struct {
	Type string `json:"type"`
	Id   string `json:"id"`
}

type PlayerStatePayload struct {
	Type  string `json:"type"`
	Id    string `json:"id"`
	State *State `json:"state"`
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go handleMoveBroadcast()
	go handleDisconnectBroadcast()
	log.Fatal(http.ListenAndServe(":1205", nil))
}

func newPlayer(conn *websocket.Conn) *Player {
	return &Player{
		conn: conn,
		id:   fmt.Sprintf("player_%d", len(playerList)+1),
		state: &State{
			Action: "idle",
			X:      XCenter,
			Y:      YCenter,
			Facing: "left",
		},
	}
}

// initiate newly connected player
func handleConnections(w http.ResponseWriter, req *http.Request) {
	conn, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Printf("failed to upgrade to websocket:\n%v\n", err)
		return
	}

	mu.Lock()
	player := newPlayer(conn)
	playerList[player] = true
	mu.Unlock()
	log.Printf("%v connected\n", player.id)

	playerStatePayload := &PlayerStatePayload{Type: "playerState", Id: player.id, State: player.state}
	clientInfoPayload := &ClientConnectionPayload{Type: "connected", Id: player.id}
	player.conn.WriteJSON(*playerStatePayload)
	player.conn.WriteJSON(*clientInfoPayload)

	go handleMessage(player)
}

func handleMessage(player *Player) {
	defer func() {
		player.conn.Close()

		mu.Lock()
		delete(playerList, player)
		mu.Unlock()

		clientInfoPayload := &ClientConnectionPayload{Type: "disconnected", Id: player.id}
		clientInfoBroadcast <- clientInfoPayload

		log.Printf("%v disconnected.", player.id)
	}()

	playerStateBroadcast <- player
	for p := range playerList {
		payload := &PlayerStatePayload{Type: "playerState", Id: p.id, State: p.state}
		err := player.conn.WriteJSON(*payload)

		if err != nil {
			log.Printf("Failed to update %v's state on %v\n", p.id, player.id)
		}
	}

	for {
		var message StateMessage
		err := player.conn.ReadJSON(&message)
		if err != nil {
			log.Printf("error reading player action:\n%v\n", err)
			return
		}

		if message.Data.Color != "" {
			player.state.Color = message.Data.Color
		}
		player.state.X = message.Data.X
		player.state.Y = message.Data.Y
		player.state.Facing = message.Data.Facing
		player.state.Frame = message.Data.Frame
		player.state.ChangeFrame = message.Data.ChangeFrame
		player.state.Action = message.Type

		playerStateBroadcast <- player
	}
}

// syncs actions of a player to the whole server
func handleMoveBroadcast() {
	for {
		player := <-playerStateBroadcast

		for p := range playerList {
			payload := &PlayerStatePayload{Type: "playerState", Id: player.id, State: player.state}
			log.Println(payload.Type, payload.Id, payload.State)
			err := p.conn.WriteJSON(*payload)

			if err != nil {
				log.Printf("%v failed to update\n", err)
				p.conn.Close()
				mu.Lock()
				delete(playerList, p)
				mu.Unlock()
			}

		}
	}
}

func handleDisconnectBroadcast() {
	for {
		clientInfo := <-clientInfoBroadcast
		for p := range playerList {
			err := p.conn.WriteJSON(*clientInfo)
			if err != nil {
				log.Printf("failed to %v %v\n", clientInfo.Type, clientInfo.Id)
				// todo error handle
			}
		}
	}
}
