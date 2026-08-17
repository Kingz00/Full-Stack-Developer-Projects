# Assembly Endgame

Assembly Endgame is an interactive word-guessing game built with React and TypeScript.

The player attempts to guess a hidden word one letter at a time. Each incorrect guess eliminates one of the programming languages displayed in the game. The player wins by revealing the word before all available languages have been eliminated.

## Overview

Assembly Endgame was built as a React and TypeScript project focused on interactive UI, component-based architecture, state management, conditional rendering, and accessibility.

The game maintains the current word, guessed letters, incorrect guesses, eliminated programming languages, and game status as React state.

## How the Game Works

1. A random word is selected.
2. The player guesses letters using the on-screen keyboard.
3. Correct guesses reveal the corresponding letters.
4. Incorrect guesses cause a programming language to be eliminated.
5. The player wins when the entire word has been revealed.
6. The player loses when enough incorrect guesses have been made.
7. A new game can be started at any time after the current game ends.

## Features

* Random word selection
* Interactive on-screen keyboard
* Correct and incorrect guess handling
* Dynamic word display
* Programming-language elimination system
* Win and loss states
* New game functionality
* Confetti animation after winning
* Visual feedback for incorrect letters
* Disabled keyboard interaction after game completion
* Screen-reader status announcements
* Responsive interface

## Tech Stack

### Frontend

* React
* TypeScript
* CSS

### Libraries

* `clsx`
* `react-confetti`

### Development

* Vite
* TypeScript
* ESLint

## Component Architecture

The application is broken into multiple React components responsible for different parts of the game interface.

The main application coordinates:

```text
Assembly Endgame
├── Header
├── Game Status
├── Languages List
├── Word Letters
├── Accessibility Status
├── Keyboard
├── New Game Button
└── Confetti
```

This keeps individual UI responsibilities separated while allowing the main game component to coordinate the overall state.

## Game State

The game tracks several pieces of state, including:

* Current word
* Guessed letters
* Randomized eliminated-language indexes
* Last guessed letter
* Game-over state
* Game-won state

The application derives information such as the number of incorrect guesses from the current state rather than storing unnecessary duplicate state.

## Keyboard Interaction

The on-screen keyboard is generated from the alphabet.

Each letter button determines whether the letter:

* Has already been guessed
* Exists in the current word
* Was an incorrect guess

The buttons are disabled once the game reaches a completed state.

## Accessibility

Accessibility was considered as part of the game's interaction model.

The application includes screen-reader announcements using an ARIA live region to communicate changes in game state and guessed letters.

Keyboard buttons also expose accessible labels so their purpose can be communicated to assistive technologies.

## Visual Feedback

The game uses visual feedback to make the state of each guess clear.

Correct and incorrect guesses receive different visual treatments, while missed letters are revealed when the game ends.

A confetti animation is displayed when the player wins.

## What I Learned

Building Assembly Endgame gave me practical experience with:

* React state management
* TypeScript
* Component composition
* Conditional rendering
* Derived state
* Event handling
* Array manipulation
* Dynamic UI generation
* Accessibility
* ARIA live regions
* Game logic
* Responsive interface development

## Future Improvements

Potential improvements include:

* Difficulty levels
* Persistent high scores
* Timer-based challenges
* Multiple word categories
* Keyboard input support
* Animations for eliminated languages
* Sound effects
* Local storage for game statistics
* Multiplayer functionality

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Kingz00/Full-Stack-Developer-Projects.git

cd "Full-Stack-Developer-Projects/Assembly Endgame - TypeScript"
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be available at the local Vite development URL shown in your terminal.

## Available Scripts

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Runs the TypeScript build and creates a production build.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run preview
```

Previews the production build locally.

## Screenshots

*Initial State*

<img width="861" height="570" alt="assembly-endgame-initial-state" src="https://github.com/user-attachments/assets/1081bf3f-a514-41e0-98e4-ba94cb558a4d" />

*During Gameplay*

<img width="865" height="575" alt="assembly-endgame-during-gameplay" src="https://github.com/user-attachments/assets/f0cb6f45-035b-4e51-b125-f15420856f51" />

*Completed Round - Loss*

<img width="855" height="577" alt="assembly-endgame-completed-round-loss" src="https://github.com/user-attachments/assets/306ceef0-b8a5-4a22-96ac-5dcd34b3022d" />

*Completed Round - Win*

<img width="849" height="628" alt="assembly-endgame-completed-round-win" src="https://github.com/user-attachments/assets/e1e99eed-665f-405b-8fc2-44009d9e84c3" />


## Live Demo

[View on Netlify](https://kingz-assembly-endgame-project.netlify.app)

## Repository

[View the source code on GitHub](https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Assembly%20Endgame%20-%20TypeScript)
