import path from 'node:path'
import fs from 'node:fs/promises'
import { getData } from './getData.js'

export const addNewSighting = async (newSighting) => {

    try {
        const dataPath = path.join('data', 'data.json')
        let data = await getData()
        data.push(newSighting)
        await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8')
        // null, 2 in the stringify method adds indentation to the json data (prettify it)

    } catch (err) {
        throw new Error(`Error: ${err}`)
    }
}