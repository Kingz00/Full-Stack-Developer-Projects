import validator from 'validator'

export async function registerUser(req, res) {

    let { name, email, username, password } = req.body

    const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,20}$/

    try{

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
            throw new Error('All fields are required.')
        }

        // Trim only specific fields using an array map or direct assignment
        ;[name, email, username] = [name, email, username].map(str => str?.trim() || '')

        res.json({ name, email, username, password })
    }
    catch(err){
        res.status(400).json({ error: 'All fields are required.'})
    }
}