package models

import "time"

type User struct {
	ID        int       `json:"id"`
	Login     string    `json:"login"`
	Username  *string   `json:"username"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
}
