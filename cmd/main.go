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
	playerList = make(map[*Player]bool)
	broadcast  = make(chan *Player)
	mu         sync.Mutex
)

type Player struct {
	conn   *websocket.Conn
	id     string
	status *Status
}

type Status struct {
	Action string `json:"action"`
	Target string `json:"target"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go handleBroadcast()
	log.Fatal(http.ListenAndServe(":1205", nil))
}

func newPlayer(conn *websocket.Conn) *Player {
	return &Player{
		conn:   conn,
		id:     fmt.Sprintf("player_%d", len(playerList)+1),
		status: &Status{Action: "idle"},
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

	go handleAction(player)
}

func handleAction(player *Player) {
	defer func() {
		player.conn.Close()
		mu.Lock()
		delete(playerList, player)
		mu.Unlock()
		log.Printf("%v disconnected.", player.id)
	}()

	for {
		var playerStatus Status
		err := player.conn.ReadJSON(&playerStatus)
		if err != nil {
			log.Printf("error reading player action:\n%v\n", err)
			return
		}

		mu.Lock()
		player.status = &playerStatus
		mu.Unlock()

		broadcast <- player
	}
}

// syncs actions of a player to the whole server
func handleBroadcast() {
	for {
		playerStatus := <-broadcast

		for player := range playerList {
			err := player.conn.WriteJSON(playerStatus)

			if err != nil {
				log.Printf("%v failed to update\n", err)
				player.conn.Close()
				mu.Lock()
				delete(playerList, player)
				mu.Unlock()
			}

		}
	}
}
