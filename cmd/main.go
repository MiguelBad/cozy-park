package main

import (
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(req *http.Request) bool { return true },
}
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Player)

type Player struct {
	conn *websocket.Conn
	id   string
	pos  Position
	mu   sync.Mutex
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

func main() {
	http.HandleFunc("/ws", handleConnections)

	log.Fatal(http.ListenAndServe(":1205", nil))
}

func handleConnections(w http.ResponseWriter, req *http.Request) {
	conn, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	clients[conn] = true
	for {
	}
}
