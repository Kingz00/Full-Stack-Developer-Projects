# Print Forge

Print Forge is a full-stack 3D-printing model discovery platform built with Next.js, TypeScript, Tailwind CSS, and SQLite.

The application provides a searchable and sortable collection of 3D-printable models, allowing users to browse the catalog, filter results, and navigate through paginated results.

## Overview

Print Forge was built to explore how a modern Next.js application can combine a responsive frontend with server-side data access and a relational database.

The application separates the presentation layer from the data-access layer, with model queries handled on the server and reusable React components responsible for presenting the results.

## Features

* Browse a collection of 3D-printable models
* Search models by relevant information
* Sort models using different ordering options
* Paginate through model results
* View individual model information
* Browse models by category
* Responsive interface for desktop and mobile devices
* Server-side data fetching with the Next.js App Router
* SQLite database for persistent model data
* Reusable React components for the model browser

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Heroicons
* React Icons

### Backend / Data

* Next.js Server Components
* SQLite
* `sqlite`
* `sqlite3`

### Development Tools

* TypeScript
* ESLint
* npm

## Application Structure

The application uses the Next.js App Router.

A simplified version of the architecture is:

```text
Print Forge
├── app/
│   ├── page.tsx
│   ├── 3d-models/
│   │   └── page.tsx
│   ├── components/
│   │   └── ModelsBrowser
│   └── ...
│
├── lib/
│   ├── models.ts
│   ├── types.ts
│   ├── constants.ts
│   └── utils.ts
│
├── public/
└── printforge.db
```

The 3D model listing page retrieves the current search, sort, and page parameters, calculates pagination, retrieves the corresponding models, and passes the data to the model browser component.

## Search, Sorting and Pagination

The model browser is designed around URL-based query parameters.

For example:

```text
/3d-models?search=dragon&sort=popular&page=2
```

The server reads the query parameters, determines the appropriate page of results, and retrieves only the required records from the database.

This approach keeps the application's filtering and pagination state represented by the URL, making the resulting pages easier to share and navigate.

## Database

Print Forge uses SQLite to store the application's model data.

The database layer is separated from the UI, with database operations implemented in the `lib` directory rather than directly inside presentation components.

This separation makes the application easier to maintain and provides a clear boundary between the user interface and data access.

## What I Learned

Building Print Forge gave me practical experience with:

* Next.js App Router
* Server-side data fetching
* TypeScript in a full-stack application
* SQLite database integration
* Query parameters
* Search and sorting logic
* Pagination
* Reusable React components
* Responsive UI development
* Separating application logic from presentation

## Future Improvements

Potential improvements include:

* User accounts
* Favorites or saved models
* Advanced category and tag filtering
* Model ratings and reviews
* User-uploaded models
* 3D model preview functionality
* File downloads
* Improved database indexing for larger datasets

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository and navigate to the project:

```bash
git clone https://github.com/Kingz00/Full-Stack-Developer-Projects.git

cd "Full-Stack-Developer-Projects/Print Forge"
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server.

```bash
npm run lint
```

Runs ESLint.

## Screenshots

Homepage
<img width="1512" height="982" alt="print-forge-home" src="https://github.com/user-attachments/assets/cb72b463-0ba6-4230-b7d5-fe887d4ab28c" />
3d-Models Page
<img width="1888" height="1065" alt="print-forge-3d-models" src="https://github.com/user-attachments/assets/85afb26e-0913-456e-9e76-aae9668fec03" />
Individual Model Page
<img width="1905" height="1067" alt="print-forge-model-page" src="https://github.com/user-attachments/assets/a465c0d9-7723-4d10-aea9-15c66833942b" />


## Live Demo

*Add your deployed application URL here.*

## Repository

[View the source code on GitHub](https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Print%20Forge)
