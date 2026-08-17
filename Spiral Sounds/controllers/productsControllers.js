import { getDBConnection } from '../db/db.js'
import { seedProductsTable } from '../sql/seedTable.js'

export async function getGenres(req, res) {

  try {

    const db = await getDBConnection()

    const { count } = await db.get(
      'SELECT COUNT(*) AS count FROM products'
    )

    if (count === 0) {
      await seedProductsTable(db)
    }

    const genreRows = await db.all('SELECT DISTINCT genre FROM products')
    const genres = genreRows.map(row => row.genre)
    res.json(genres)

  } catch (err) {

    res.status(500).json({ error: 'Failed to fetch genres', details: err.message })

  }
}

export async function getProducts(req, res) {

  try {

    const db = await getDBConnection()

    const { count } = await db.get(
      'SELECT COUNT(*) AS count FROM products'
    )

    if (count === 0) {
      await seedProductsTable(db)
    }

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

  }

}