import { getDBConnection } from '../db/db.js'

export async function getGenres(req, res) {

  const db = await getDBConnection()

  try {

    const genreRows = await db.all('SELECT DISTINCT genre FROM products')

    const genres = genreRows.map(row => row.genre)

    res.json(genres)

  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch genres', details: err.message })

  } finally {
    if (db) {
      await db.close()
    }
  }
}

export async function getProducts(req, res) {

  const db = await getDBConnection()

  try {

    let query = 'SELECT * FROM products'
    let params = []

    const { genre, search } = req.query

    if (genre) {
      query += ' WHERE genre = ?'
      params.push(genre)
    }
    else if (search) {
      query += ` WHERE genre LIKE ? OR artist LIKE ? OR title LIKE ?`
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    const products = await db.all(query, params)

    res.json(products)


  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch products', details: err.message })

  } finally {
    if (db) {
      await db.close()
    }
  }

}