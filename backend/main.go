package main

import (
	"context"
	"log"
	"os"
	"strconv"

	"darts-backend/api/routes"
	"darts-backend/db"
	"darts-backend/db/repository"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Не удалось загрузить .env: %v, используем переменные окружения", err)
	}
	if os.Getenv("DATABASE_URL") == "" {
		log.Fatalf("DATABASE_URL не установлен, без него не взлетим")
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
	if _, err := strconv.Atoi(port); err != nil {
		log.Fatalf("Порт %s — это не число, дебил", port)
	}

	log.Printf("Сервер слушает порт %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Сервер сдох: %v", err)
	}
}
