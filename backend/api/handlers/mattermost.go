package handlers

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

type MattermostRequest struct {
	Message string `json:"message"`
}

// SendToMattermost godoc
// @Summary Шлёт сообщение в Mattermost
// @Tags mattermost
// @Accept json
// @Produce json
// @Param request body MattermostRequest true "Сообщение"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /send-to-mattermost [post]
func SendToMattermost(c echo.Context) error {
	var payload MattermostRequest
	if err := c.Bind(&payload); err != nil {
		log.Printf("Ошибка декодирования JSON: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	webhookURL := os.Getenv("MATTERMOST_HOOK")
	if webhookURL == "" {
		log.Println("MATTERMOST_HOOK не указан")
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Webhook не настроен"})
	}

	data := map[string]string{"text": payload.Message}
	body, _ := json.Marshal(data)
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Ошибка отправки: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to send"})
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Mattermost вернул статус %d", resp.StatusCode)
		return c.JSON(resp.StatusCode, map[string]string{"error": "Mattermost вернул ошибку"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Отправлено, дебил!"})
}
