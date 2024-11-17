package main

import (
	"log"
	// "time"
)

func handleMovement(playerStatus *Status, key string) {
	log.Println(playerStatus.Pressing)
	// for playerStatus.Pressing {
	// 	log.Println(playerStatus.Pressing)
	// 	switch key {
	// 	case "w":
	// 		playerStatus.Y = playerStatus.Y - 2
	// 		tickerMS := time.NewTicker(100 * time.Millisecond)
	// 		for i := 0; i < 2; i++ {
	// 			<-tickerMS.C
	// 			playerStatus.Y = playerStatus.Y - 2
	// 		}
	//
	// 	case "a":
	// 		playerStatus.X = playerStatus.X - 2
	// 		playerStatus.Direction = "left"
	// 		tickerMS := time.NewTicker(100 * time.Millisecond)
	// 		for i := 0; i < 2; i++ {
	// 			<-tickerMS.C
	// 			playerStatus.X = playerStatus.X - 2
	// 		}
	//
	// 	case "s":
	// 		playerStatus.Y = playerStatus.Y + 2
	// 		tickerMS := time.NewTicker(100 * time.Millisecond)
	// 		for i := 0; i < 2; i++ {
	// 			<-tickerMS.C
	// 			playerStatus.Y = playerStatus.Y + 2
	// 		}
	//
	// 	case "d":
	// 		playerStatus.X = playerStatus.X + 2
	// 		playerStatus.Direction = "right"
	// 		tickerMS := time.NewTicker(100 * time.Millisecond)
	// 		for i := 0; i < 2; i++ {
	// 			<-tickerMS.C
	// 			playerStatus.X = playerStatus.X + 2
	// 		}
	// 	}
	// }
}
