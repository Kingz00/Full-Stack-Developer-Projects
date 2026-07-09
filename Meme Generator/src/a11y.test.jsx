import { test, expect, describe } from 'vitest'

import { render, screen } from '@testing-library/react'

import App from './App'


describe("a11y", () => {

    test("ensures troll face image is accessible", () => {
        render(<App />)

        expect(screen.getByAltText("Troll face")).toBeInTheDocument()
    })

    test("ensures meme image is accessible", () => {
        render(<App />)

        expect(screen.getByAltText("Meme image from Api")).toBeInTheDocument()
    })
})