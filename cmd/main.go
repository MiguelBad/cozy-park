package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

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
	Action string `json:"action"`
	Target string `json:"target"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
	Frame  int    `json:"frame"`
	Facing string `json:"facing"`
	moving bool
}

type StateMessage struct {
	X      int    `json:"x"`
	Y      int    `json:"y"`
	Facing string `json:"facing"`
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
		conn:  conn,
		id:    fmt.Sprintf("player_%d", len(playerList)+1),
		state: &State{Action: "idle", Facing: "right"},
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
		var data StateMessage
		err := player.conn.ReadJSON(&data)
		if err != nil {
			log.Printf("error reading player action:\n%v\n", err)
			return
		}

		player.state.X = data.X
		player.state.Y = data.Y
		player.state.Facing = data.Facing

		playerStateBroadcast <- player
	}
}

// syncs actions of a player to the whole server
func handleMoveBroadcast() {
	for {
		player := <-playerStateBroadcast

		for p := range playerList {
			payload := &PlayerStatePayload{Type: "playerState", Id: player.id, State: player.state}
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
