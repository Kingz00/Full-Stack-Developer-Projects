CREATE TABLE battles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL,
    hero_id INTEGER NOT NULL,

    player_health INTEGER NOT NULL
        CHECK (player_health >= 0),

    player_max_health INTEGER NOT NULL
        CHECK (player_max_health > 0),

    enemy_name TEXT NOT NULL,

    enemy_health INTEGER NOT NULL
        CHECK (enemy_health >= 0),

    enemy_max_health INTEGER NOT NULL
        CHECK (enemy_max_health > 0),
    
    enemy_attack INTEGER NOT NULL 
        CHECK (enemy_attack > 0),

    enemy_defense INTEGER NOT NULL 
        CHECK (enemy_defense >= 0),

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'won', 'lost', 'draw', 'abandoned')),

    started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,

    FOREIGN KEY (run_id)
        REFERENCES game_runs(id)
        ON DELETE CASCADE,

    FOREIGN KEY (hero_id)
        REFERENCES heroes(id)
);

CREATE INDEX idx_battles_run_id
ON battles(run_id);