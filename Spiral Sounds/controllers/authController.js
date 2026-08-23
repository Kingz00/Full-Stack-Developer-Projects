import validator from 'validator'
import bcrypt from 'bcryptjs'
import { getDBConnection } from '../db/db.js'

export async function registerUser(req, res, next) {

    let { name, email, username, password } = req.body

    if (
        validator.isEmpty(name ?? '') ||
        validator.isEmpty(email ?? '') ||
        validator.isEmpty(username ?? '') ||
        validator.isEmpty(password ?? '')
    ) {
        return res.status(400).json({
            error: 'All fields are required.'
        })
    }

    // Trim only specific fields using an array map or direct assignment
    ;[name, email, username] = [name, email, username].map(
        str => str.trim()
    )

    // normalize the email
    email = email.toLowerCase()

    const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,20}$/

    if (!name) {
        return res.status(400).json({
            error: 'Enter your full name.'
        })
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({
            error: 'Invalid email format.'
        })
    }

    if (!USERNAME_REGEX.test(username)) {
        return res.status(400).json({
            error: 'Invalid username format. Must be 1-20 characters using only letters, numbers, underscores, or hyphens.'
        })
    }

    if (password.length < 8) {
        return res.status(400).json({
            error: 'Password must be at least 8 characters long.'
        })
    }

    // encrypt password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    password = hashedPassword

    // get a connection to the database
    const db = await getDBConnection()

    try {

        const existingUser = await db.get(`
            SELECT * FROM users WHERE email = ? OR username = ?
            `,
            [email, username])

        // check if the user with the same email or username exists in the database
        if (existingUser) {

            if (existingUser.email === email) {
                return res.status(409).json({
                    error: 'An account with this email already exists.'
                })
            }

            if (existingUser.username === username) {
                return res.status(409).json({
                    error: 'That username is already taken.'
                })
            }
        }

        // add the user to the database
        await db.exec('BEGIN TRANSACTION')

        const result = await db.run(`
            INSERT INTO users (name, email, username, password)
            VALUES (?, ?, ?, ?)
            `,
            [name, email, username, password])

        await db.exec('COMMIT')

        // store the 'lastID' from the database insertion to the 'userId' property on the 'session' object on the request
        req.session.userId = result.lastID

        res.status(201).json({ message: 'User registered' })

    }
    catch (err) {
        try {
            if (db) {
                await db.exec('ROLLBACK');
            }
        } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr);
        }
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}


export async function loginUser(req, res, next) {

    let { username, password } = req.body

    if (validator.isEmpty(username ?? '') || validator.isEmpty(password ?? '')) {
        return res.status(400).json({ error: 'Username and password are required.' })
    }

    // remove whitespaces from username
    username = username.trim()

    const db = await getDBConnection()

    try {

        const user = await db.get(`
        SELECT id, username, password FROM users WHERE username = ?
        `,
            [username])

        if (!user) {

            return res.status(401).json({
                error: 'Invalid username or password.'
            })
        }

        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {

            return res.status(401).json({
                error: 'Invalid username or password.'
            })
        }

        // create a session for the user based on their id in the database
        req.session.userId = user.id

        res.json({ message: 'Logged in' })
    }
    catch (err) {
        next(err)
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}

export async function logoutUser(req, res) {

    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: 'Could not log out. Please try again.' })
            }

            res.json({ message: 'Logged out' })
        })
    }
}