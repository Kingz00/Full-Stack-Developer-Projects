import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'node:path'

function getDatabasePath() {
  return process.env.DATABASE_PATH || path.join(process.cwd(), 'database.db')
}

export async function getDBConnection() {

  const db = await open({
    filename: getDatabasePath(),
    driver: sqlite3.Database
  })

  // enforce foreign-key constraints on SQLite
  await db.run('PRAGMA foreign_keys = ON')

  return db
}

export async function initializeDatabase(db) {
  await db.exec(`

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            price REAL NOT NULL CHECK (price >= 0),
            image TEXT NOT NULL,
            year INTEGER,
            genre TEXT,
            stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
        )
    `)

  await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)

  await db.exec(`

        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id),
            UNIQUE (user_id, product_id)
        )
    `)

  await db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `)

  await db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK (quantity > 0),
            price REAL NOT NULL CHECK (price >= 0),
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `)
}