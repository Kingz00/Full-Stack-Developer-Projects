import validator from 'validator'
import bcrypt from 'bcryptjs'
import { getDBConnection } from '../db/db.js'

export async function registerUser(req, res) {

    let { name, email, username, password } = req.body

    const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,20}$/

    if(!name.trim()) {
        return res.status(400).json({
            error: 'Enter your full name.'
        })
    }

    if(!validator.isEmail(email.trim())){
        return res.status(400).json({
            error: 'Invalid email format.'
        })
    }

    if(!USERNAME_REGEX.test(username.trim())){
        return res.status(400).json({ 
        error: 'Invalid username format. Must be 1-20 characters using only letters, numbers, underscores, or hyphens.' 
    })
    }

    if(validator.isEmpty(name) || validator.isEmpty(email) || validator.isEmpty(username) || validator.isEmpty(password)){
        return res.status(400).json({ error: 'All fields are required.'})
        throw new Error('All fields are required.')
    }

    // Trim only specific fields using an array map or direct assignment
    ;[name, email, username] = [name, email, username].map(str => str?.trim() || '')

    // encrypt password using bcrypt

    const hashedPassword = await bcrypt.hash(password, 10)

    password = hashedPassword

    const db = await getDBConnection()
    
    try{

        const existing = await db.get(`
            SELECT * FROM users WHERE email = ? OR password = ?
            `,
        [email, password])

        if(existing){
           return res.status(400).json({ error: 'Email or username already in use.' }) 
        }

        await db.exec('BEGIN TRANSACTION')

        await db.run(`
            INSERT INTO users (name, email, username, password)
            VALUES (?, ?, ?, ?)
            `,
        [name, email, username, password])

        await db.exec('COMMIT')

        res.status(201).json({ message: 'User registered'})
        
    }
    catch(err){
        try {
            if (db) {
                await db.exec('ROLLBACK');
            }
        } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr);
        }
        console.error('Registration error:', err.message)
        res.status(500).json({error: 'Registration failed. Please try again.'})
    }
    finally{
        if(db) {
            await db.close()
        }
    }
}