package handlers

import (
	"context"
	"net/http"

	"darts-backend/db/repository"

	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	Repo *repository.UserRepository
}
type UserResponse struct {
	Login    string  `json:"login"`
	Color    string  `json:"color"`
	Username *string `json:"username"`
}

type RegisterRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
	Color    string `json:"color"`
}

// Register godoc
// @Summary Регистрирует пользователя
// @Tags users
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "User data"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/register [post]
func (h *UserHandler) Register(c echo.Context) error {
	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	if req.Login == "" || req.Password == "" || req.Color == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing required fields"})
	}

	err := h.Repo.Register(context.Background(), req.Login, req.Password, req.Color)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "User registered, дебил!"})
}

// GetUsers godoc
// @Summary Получает всех пользователей
// @Tags users
// @Produce json
// @Success 200 {array} handlers.UserResponse
// @Failure 500 {object} map[string]string
// @Router /api/users [get]
func (h *UserHandler) GetUsers(c echo.Context) error {
	users, err := h.Repo.GetUsers(context.Background())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	var resp []UserResponse
	for _, u := range users {
		resp = append(resp, UserResponse{
			Login: u.Login,
			Color: u.Color,
		})
	}

	return c.JSON(http.StatusOK, resp)
}
