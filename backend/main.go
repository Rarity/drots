package main

import (
	"context"
	"log"
	"os"

	"darts-backend/api/routes"
	"darts-backend/db"
	"darts-backend/db/repository"

	_ "darts-backend/docs"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Не удалось загрузить .env, ну и похер")
	}

	ctx := context.Background()
	database, err := db.NewDB(ctx)
	if err != nil {
		log.Fatalf("База не взлетела: %v", err)
	}
	defer database.Close()

	userRepo := repository.NewUserRepository(database)
	e := echo.New()

	routes.Register(e, userRepo)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Сервер слушает порт %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Сервер сдох: %v", err)
	}
}
