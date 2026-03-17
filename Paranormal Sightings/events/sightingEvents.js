import { EventEmitter } from 'node:events'
import { createAlert } from '../utils/createAlert.js'

export const sightingEvent = new EventEmitter() // Creates an instance of the EventEmitter
sightingEvent.on('sighting-added', createAlert) // Registers the listener
