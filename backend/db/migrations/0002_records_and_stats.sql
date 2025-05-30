
-- user_records: индивидуальные рекорды пользователей
CREATE TABLE user_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- например: 'best_3dart', 'best_total_score'
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_stats_cache: агрегированная статистика по пользователям
CREATE TABLE user_stats_cache (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER NOT NULL DEFAULT 0,
    avg_place NUMERIC(4,2) DEFAULT 0,
    first_places INTEGER DEFAULT 0,
    second_places INTEGER DEFAULT 0,
    third_places INTEGER DEFAULT 0,
    avg_score NUMERIC(5,2) DEFAULT 0,
    best_three_dart_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- user_placements: подробное распределение по местам
CREATE TABLE user_placements (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    place INTEGER NOT NULL,
    total INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, place)
);
