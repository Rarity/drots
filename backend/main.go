package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Загружаем .env
	if err := godotenv.Load(); err != nil {
		log.Println("Не удалось загрузить .env, используем переменные окружения")
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	// Добавляем middleware для CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"}, // Укажи твой прод-домен
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300, // Кэш префлайт-запросов
	}))

	// Логирование запросов
	r.Use(middleware.Logger)

	// Эндпоинт для отправки в Mattermost
	r.Post("/send-to-mattermost", func(w http.ResponseWriter, r *http.Request) {
		var payload struct {
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			log.Printf("Ошибка декодирования JSON: %v", err)
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		webhookUrl := os.Getenv("MATTERMOST_HOOK")
		if webhookUrl == "" {
			log.Println("MATTERMOST_HOOK не указан в .env")
			http.Error(w, "Mattermost webhook URL not configured", http.StatusInternalServerError)
			return
		}

		data := map[string]string{"text": payload.Message}
		body, _ := json.Marshal(data)
		resp, err := http.Post(webhookUrl, "application/json", bytes.NewBuffer(body))
		if err != nil {
			log.Printf("Ошибка отправки в Mattermost: %v", err)
			http.Error(w, "Failed to send to Mattermost", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("Mattermost вернул статус %d", resp.StatusCode)
			http.Error(w, "Mattermost returned non-OK status", resp.StatusCode)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Sent to Mattermost, дебил!"))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Запускаем сервер на :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
