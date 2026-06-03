import validator from 'validator'
import bcrypt from 'bcryptjs'
import { getDBConnection } from '../db/db.js'

export async function registerUser(req, res) {

    let { name, email, username, password } = req.body

    const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,20}$/

    if (!name.trim()) {
        return res.status(400).json({
            error: 'Enter your full name.'
        })
    }

    if (!validator.isEmail(email.trim())) {
        return res.status(400).json({
            error: 'Invalid email format.'
        })
    }

    if (!USERNAME_REGEX.test(username.trim())) {
        return res.status(400).json({
            error: 'Invalid username format. Must be 1-20 characters using only letters, numbers, underscores, or hyphens.'
        })
    }

    if (validator.isEmpty(name) || validator.isEmpty(email) || validator.isEmpty(username) || validator.isEmpty(password)) {
        return res.status(400).json({ error: 'All fields are required.' })
        throw new Error('All fields are required.')
    }

    // Trim only specific fields using an array map or direct assignment
    ;[name, email, username] = [name, email, username].map(str => str?.trim() || '')

    // encrypt password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10)

    password = hashedPassword

    // get a connection to the database
    const db = await getDBConnection()

    try {

        const existing = await db.get(`
            SELECT * FROM users WHERE email = ? OR password = ?
            `,
            [email, password])

        // check if the user with the same email or username exists in the database
        if (existing) {
            return res.status(400).json({ error: 'Email or username already in use.' })
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
        console.error('Registration error:', err.message)
        res.status(500).json({ error: 'Registration failed. Please try again.' })
    }
    finally {
        if (db) {
            await db.close()
        }
    }
}


export async function loginUser(req, res) {

    try {

        let { username, password } = req.body

        if (validator.isEmpty(username) || validator.isEmpty(password)) {
            return res.status(400).json({ error: 'All fields are required' })
        }

        // remove whitespaces from username
        username = username.trim()

        const db = await getDBConnection()

        try {

            const user = await db.get(`
            SELECT id, username, password FROM users WHERE username = ?
            `,
                [username])

            const isValidPassword = await bcrypt.compare(password, user.password)

            if (!user || !isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' })
            }

            // create a session for the user based on their id in the database
            req.session.userId = user.id

            res.json({ message: 'Logged in' })
        }
        catch (err) {
            res.status(401).json({ error: 'Invalid credentials' })
        }
        finally {
            if (db) {
                await db.close()
            }
        }
    }
    catch (err) {
        console.error('Login error:', err.message)
        res.status(500).json({ error: 'Login failed. Please try again.' })
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