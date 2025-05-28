-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50),
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы типов игр
CREATE TABLE game_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Создание таблицы игр
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    game_type_id INTEGER REFERENCES game_types(id),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result JSONB
);

-- Создание таблицы участников игры
CREATE TABLE game_players (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id),
    user_id INTEGER REFERENCES users(id),
    throws JSONB NOT NULL,
    score INTEGER NOT NULL
);

-- Создание таблицы связи пользователей и игр
CREATE TABLE user_games (
    user_id INTEGER REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    PRIMARY KEY (user_id, game_id)
);