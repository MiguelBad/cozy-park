package main

import (
	"log"
	"time"
)

func handleMovement(player *Player, key string) {
	for player.status.moving {
		mu.Lock()
		switch key {
		case "w":
			player.status.Y = player.status.Y - 30

		case "a":
			player.status.X = player.status.X - 30
			player.status.Direction = "left"

		case "s":
			player.status.Y = player.status.Y + 30

		case "d":
			player.status.X = player.status.X + 30
			player.status.Direction = "right"
		}
		mu.Unlock()

		broadcast <- player

		time.Sleep(100 * time.Millisecond)
		log.Println("moving")
	}
}
