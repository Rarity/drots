package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"darts-backend/db"
	"darts-backend/db/repository"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Не удалось загрузить .env, используем переменные окружения")
	}

	ctx := context.Background()
	db, err := db.NewDB(ctx)
	if err != nil {
		log.Fatalf("Не могу запустить базу, дебил: %v", err)
	}
	defer db.Close()

	userRepo := repository.NewUserRepository(db)

	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
		AllowHeaders: []string{echo.HeaderAccept, echo.HeaderAuthorization, echo.HeaderContentType},
		MaxAge:       300,
	}))

	e.POST("/send-to-mattermost", func(c echo.Context) error {
		var payload struct {
			Message string `json:"message"`
		}
		if err := c.Bind(&payload); err != nil {
			log.Printf("Ошибка декодирования JSON: %v", err)
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		webhookURL := os.Getenv("MATTERMOST_HOOK")
		if webhookURL == "" {
			log.Println("MATTERMOST_HOOK не указан")
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Mattermost webhook URL not configured"})
		}

		data := map[string]string{"text": payload.Message}
		body, _ := json.Marshal(data)
		resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(body))
		if err != nil {
			log.Printf("Ошибка отправки в Mattermost: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to send to Mattermost"})
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("Mattermost вернул статус %d", resp.StatusCode)
			return c.JSON(resp.StatusCode, map[string]string{"error": "Mattermost returned non-OK status"})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "Sent to Mattermost, дебил!"})
	})

	e.POST("/api/register", func(c echo.Context) error {
		var req struct {
			Login    string `json:"login"`
			Password string `json:"password"`
			Color    string `json:"color"`
		}
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
		}

		if req.Login == "" || req.Password == "" || req.Color == "" {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing required fields"})
		}

		err := userRepo.Register(c.Request().Context(), req.Login, req.Password, req.Color)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}

		return c.JSON(http.StatusOK, map[string]string{"message": "User registered, дебил!"})
	})

	e.GET("/api/users", func(c echo.Context) error {
		users, err := userRepo.GetUsers(c.Request().Context())
		if err != nil {
			log.Printf("Ошибка получения юзеров: %v", err)
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusOK, users)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Запускаем сервер на :%s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Сервер упал, дебил: %v", err)
	}
}
