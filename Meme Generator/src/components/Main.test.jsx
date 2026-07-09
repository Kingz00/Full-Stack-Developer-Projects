import { test, expect, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import Main from './Main.jsx'

describe("Main", () => {
    test("displays the top and bottom text lines and the meme image", () => {
        render(<Main />)
        expect(screen.getByText("One does not simply")).toBeInTheDocument()
        expect(screen.getByText("Walk into Mordor")).toBeInTheDocument()
        expect(screen.getByRole("img").src).toBe("http://i.imgflip.com/1bij.jpg")
    })
    test("displays the input fields correctly", () => {
        render(<Main />)
        expect(screen.getByText("Top Text")).toBeInTheDocument()
        expect(screen.getByText("Bottom Text")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("One does not simply")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Walk into Mordor")).toBeInTheDocument()
        expect(screen.getByRole("button").textContent).toBe("Get a new meme image 🖼")
    })
})