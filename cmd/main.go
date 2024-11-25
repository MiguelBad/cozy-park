package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

const xStart = 2200
const yStart = 1300

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(req *http.Request) bool { return true },
	}

	playerStateBroadcast = make(chan *Player)
	clientInfoBroadcast  = make(chan *ClientConnectionPayload)
	diningInfoBroadcast  = make(chan *DiningStatePayload)

	playerList = newPlayerList()
)

type PlayerList struct {
	pList map[*Player]bool
	mu    sync.Mutex
}

type Player struct {
	conn  *websocket.Conn
	id    string
	state *State
	mu    sync.Mutex
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
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

type PlayerMessage struct {
	Color       string `json:"color"`
	X           int    `json:"x"`
	Y           int    `json:"y"`
	Facing      string `json:"facing"`
	Frame       int    `json:"frame"`
	ChangeFrame bool   `json:"changeFrame"`
	Action      string `json:"action"`
}

type DiningMessage struct {
	Left  string `json:"left"`
	Right string `json:"right"`
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

type DiningStatePayload struct {
	Type  string `json:"type"`
	Left  string `json:"left"`
	Right string `json:"right"`
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go handleMoveBroadcast()
	go handleDisconnectBroadcast()
	go handleDiningBroadcast()
	log.Fatal(http.ListenAndServe(":1205", nil))
}

func newPlayerList() *PlayerList {
	return &PlayerList{pList: make(map[*Player]bool)}
}

func newPlayer(conn *websocket.Conn) *Player {
	return &Player{
		conn: conn,
		id:   fmt.Sprintf("player_%d", len(playerList.pList)+1),
		state: &State{
			Action: "idle",
			X:      xStart,
			Y:      yStart,
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

	player := newPlayer(conn)
	playerList.mu.Lock()
	playerList.pList[player] = true
	playerList.mu.Unlock()
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

		playerList.mu.Lock()
		delete(playerList.pList, player)
		playerList.mu.Unlock()

		clientInfoPayload := &ClientConnectionPayload{Type: "disconnected", Id: player.id}
		clientInfoBroadcast <- clientInfoPayload

		log.Printf("%v disconnected.", player.id)
	}()

	playerStateBroadcast <- player
	for p := range playerList.pList {
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

		switch message.Type {
		case "player":
			databytes, err := json.Marshal(message.Data)
			if err != nil {
				log.Printf("failed to encode json on player message data:\n%v\n", err)
			}

			var playerMessage PlayerMessage
			err = json.Unmarshal(databytes, &playerMessage)
			if err != nil {
				log.Printf("failed to decode player message data:\n%v\n", err)
			}

			if playerMessage.Color != "" {
				player.state.Color = playerMessage.Color
			}
			player.state.X = playerMessage.X
			player.state.Y = playerMessage.Y
			player.state.Facing = playerMessage.Facing
			player.state.Frame = playerMessage.Frame
			player.state.ChangeFrame = playerMessage.ChangeFrame
			player.state.Action = playerMessage.Action

		case "dining":
			databytes, err := json.Marshal(message.Data)
			if err != nil {
				log.Printf("failed to encode on dining data:\n%v\n", err)
			}

			var diningMessage DiningMessage
			err = json.Unmarshal(databytes, &diningMessage)
			if err != nil {
				log.Printf("failed to decode dining message data:\n%v\n", err)
			}

			diningStatePayload := &DiningStatePayload{
				Type:  "diningState",
				Left:  diningMessage.Left,
				Right: diningMessage.Right,
			}
			log.Println(diningStatePayload)
			diningInfoBroadcast <- diningStatePayload
		}

		playerStateBroadcast <- player
	}
}

// syncs actions of a player to the whole server
func handleMoveBroadcast() {
	for {
		player := <-playerStateBroadcast

		for p := range playerList.pList {
			payload := &PlayerStatePayload{Type: "playerState", Id: player.id, State: player.state}
			// log.Println(payload.Type, payload.Id, payload.State)
			p.mu.Lock()
			err := p.conn.WriteJSON(*payload)
			p.mu.Unlock()

			if err != nil {
				log.Printf("%v failed to update\n", err)
				p.conn.Close()
				playerList.mu.Lock()
				delete(playerList.pList, p)
				playerList.mu.Unlock()
			}

		}
	}
}

func handleDisconnectBroadcast() {
	for {
		clientInfo := <-clientInfoBroadcast
		for p := range playerList.pList {
			p.mu.Lock()
			err := p.conn.WriteJSON(*clientInfo)
			p.mu.Unlock()
			if err != nil {
				log.Printf("failed to %v %v\n", clientInfo.Type, clientInfo.Id)
				// todo error handle
			}
		}
	}
}

func handleDiningBroadcast() {
	for {
		diningInfo := <-diningInfoBroadcast
		for p := range playerList.pList {
			log.Println(diningInfo)
			p.mu.Lock()
			err := p.conn.WriteJSON(*diningInfo)
			p.mu.Unlock()
			if err != nil {
				log.Printf("failed to send dining info to %v\n:%v\n", p.id, err)
				// todo error handle
			}
		}
	}
}
