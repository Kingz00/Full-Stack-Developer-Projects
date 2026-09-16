CREATE TABLE battle_rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    battle_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,

    player_roll INTEGER NOT NULL
        CHECK (player_roll >= 0),

    enemy_roll INTEGER NOT NULL
        CHECK (enemy_roll >= 0),

    player_damage INTEGER NOT NULL
        CHECK (player_damage >= 0),

    enemy_damage INTEGER NOT NULL
        CHECK (enemy_damage >= 0),

    player_health_after INTEGER NOT NULL
        CHECK (player_health_after >= 0),

    enemy_health_after INTEGER NOT NULL
        CHECK (enemy_health_after >= 0),

    outcome TEXT NOT NULL
        CHECK (outcome IN ('win', 'loss', 'draw')),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (battle_id)
        REFERENCES battles(id)
        ON DELETE CASCADE,

    UNIQUE (battle_id, round_number)
);

CREATE INDEX idx_battle_rounds_battle_id
ON battle_rounds(battle_id);