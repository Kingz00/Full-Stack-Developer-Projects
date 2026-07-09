import { test, expect, describe } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import App from './App'

describe("App", () => {

    test("updates the top text", async () => {
        // Arrange
        const user = userEvent.setup()
        render(<App />)
        const topTextbox = screen.getAllByRole('textbox')[0]

        // Act
        await user.clear(topTextbox)
        await user.type(topTextbox, "A coder does not simply")

        // Assert
        expect(screen.getByText("A coder does not simply")).toBeInTheDocument()
    })

    test("updates the bottom text", async () => {
        // Arrange
        const user = userEvent.setup()
        render(<App />)
        const bottomTextbox = screen.getAllByRole('textbox')[1]

        // Act
        await user.clear(bottomTextbox)
        await user.type(bottomTextbox, "Code without coffee")

        // Assert
        expect(screen.getByText("Code without coffee")).toBeInTheDocument()
    })

    test("changes the meme image when the button is clicked", async () => {
        // Arrange
        const user = userEvent.setup()
        render(<App />)
        const getMemeBtn = screen.getByRole('button')

        // Act
        await user.click(getMemeBtn)

        // Assert
        expect(screen.getAllByRole("img")[1].src).toBe("https://i.imgflip.com/1c1uej.jpg")
    })
})