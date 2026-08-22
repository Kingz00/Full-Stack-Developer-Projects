import { getDBConnection } from '../db/db.js'

export async function getGenres(req, res, next) {

  const db = await getDBConnection()

  try {

    const genreRows = await db.all('SELECT DISTINCT genre FROM products')

    const genres = genreRows.map(row => row.genre)

    res.json(genres)

  } catch (err) {

    next(err)

  } finally {
    if (db) {
      await db.close()
    }
  }
}

export async function getProducts(req, res, next) {

  const db = await getDBConnection()

  try {

    const { genre, search } = req.query

    const conditions = []
    const params = []

    if (genre) {
      conditions.push('genre = ?')
      params.push(genre)
    }

    if (search) {
      conditions.push(`(
          genre LIKE ?
          OR artist LIKE ?
          OR title LIKE ?
        )
    `)

      const searchPattern = `%${search}%`

      params.push(
        searchPattern,
        searchPattern,
        searchPattern
      )
    }

    let query = 'SELECT * FROM products'

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`
    }

    const products = await db.all(query, params)

    res.json(products)


  } catch (err) {
    next(err)

  } finally {
    if (db) {
      await db.close()
    }
  }

}