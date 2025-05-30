package routes

import (
	"darts-backend/api/handlers"
	"darts-backend/db/repository"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	echoSwagger "github.com/swaggo/echo-swagger"
)

func Register(e *echo.Echo, repo *repository.UserRepository) {
	userHandler := handlers.UserHandler{Repo: repo}

	e.Use(middleware.Logger())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"GET", "POST", "OPTIONS"},
		AllowHeaders: []string{"Accept", "Authorization", "Content-Type"},
		MaxAge:       300,
	}))

	e.GET("/swagger/*", echoSwagger.WrapHandler)
	e.POST("/send-to-mattermost", handlers.SendToMattermost)
	e.POST("/api/register", userHandler.Register)
	e.GET("/api/users", userHandler.GetUsers)
}
