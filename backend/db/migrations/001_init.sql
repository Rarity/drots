-- users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50),
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- groups
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_groups
CREATE TABLE user_groups (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('member', 'admin')),
    PRIMARY KEY (user_id, group_id)
);

-- game_types
CREATE TABLE game_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- games
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    game_type_id INTEGER REFERENCES game_types(id) ON DELETE SET NULL,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'finished')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result JSONB
);

-- game_players
CREATE TABLE game_players (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    throws JSONB NOT NULL
);

-- throws (если хочешь норм аналитику)
CREATE TABLE throws (
    id SERIAL PRIMARY KEY,
    game_player_id INTEGER REFERENCES game_players(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    value INTEGER NOT NULL,
    position TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

