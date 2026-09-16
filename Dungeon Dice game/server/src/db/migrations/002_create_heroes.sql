CREATE TABLE heroes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    health INTEGER NOT NULL CHECK (health > 0),
    attack INTEGER NOT NULL CHECK (attack > 0),
    defense INTEGER NOT NULL CHECK (defense >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);