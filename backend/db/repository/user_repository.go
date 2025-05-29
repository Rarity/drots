package repository

import (
	"context"
	"fmt"

	"darts-backend/db"
	"darts-backend/db/models"

	"golang.org/x/crypto/bcrypt"
)

type UserRepository struct {
	db *db.DB
}

func NewUserRepository(db *db.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Register(ctx context.Context, login, password, color string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("не могу захэшить пароль: %v", err)
	}

	_, err = r.db.Pool.Exec(ctx, `
        INSERT INTO users (login, password_hash, color)
        VALUES ($1, $2, $3)
    `, login, string(hash), color)
	if err != nil {
		return fmt.Errorf("не могу создать юзера: %v", err)
	}

	return nil
}

func (r *UserRepository) GetUsers(ctx context.Context) ([]models.User, error) {
	rows, err := r.db.Pool.Query(ctx, "SELECT id, login, username, color, created_at FROM users")
	if err != nil {
		return nil, fmt.Errorf("не могу получить юзеров: %v", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Login, &u.Username, &u.Color, &u.CreatedAt); err != nil {
			return nil, fmt.Errorf("не могу просканировать юзера: %v", err)
		}
		users = append(users, u)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("ошибка в рядах: %v", err)
	}

	return users, nil
}
