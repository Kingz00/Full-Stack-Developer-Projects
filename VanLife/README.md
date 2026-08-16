# VanLife

VanLife is a responsive van-rental web application built with React and React Router.

The application allows users to browse available vans, view individual vehicle details, and access a host dashboard for managing van-related information.

## Overview

VanLife was built to explore modern React Router patterns, including nested routes, dynamic routes, route loaders, route actions, protected routes, and error handling.

The application contains two main experiences:

* A customer-facing van rental interface
* A host dashboard for managing and viewing van information

The project uses MirageJS to provide a mock API/data layer during development.

## Features

### Customer Experience

* Browse available vans
* Filter and explore van listings
* View individual van details
* Navigate between application pages
* Login functionality
* Loading and error states
* Responsive user interface

### Host Dashboard

Authenticated hosts can access:

* Dashboard
* Income information
* Reviews
* Van listings
* Individual van information
* Van pricing information
* Van photos

The host section uses protected routes so authenticated functionality cannot be accessed without authorization.

## Tech Stack

### Frontend

* React
* React Router DOM
* React Icons
* CSS

### Application / Data

* React Router loaders
* React Router actions
* MirageJS
* Firebase
* Environment variables with `dotenv`

### Development

* Vite
* JavaScript
* npm

## Application Architecture

The application uses React Router's data-router APIs.

A simplified route structure is:

```text
/
├── Home
├── About
├── Login
├── Vans
│   └── Vans/:id
│
└── Host
    ├── Dashboard
    ├── Income
    ├── Reviews
    ├── Vans
    │   └── Vans/:id
    │       ├── Info
    │       ├── Pricing
    │       └── Photos
```

The application uses nested routes for the host dashboard and individual host van pages.

## React Router

One of the primary goals of this project was to gain practical experience with React Router's data APIs.

The application uses:

* `createBrowserRouter`
* `createRoutesFromElements`
* Nested routes
* Dynamic route parameters
* Route loaders
* Route actions
* Protected routes
* Error elements

For example, van detail pages use dynamic route parameters:

```text
/vans/:id
```

while host van pages use nested routes:

```text
/host/vans/:id
/host/vans/:id/pricing
/host/vans/:id/photos
```

This structure allows related pages to share layouts and routing context.

## Authentication and Protected Routes

The host dashboard contains routes that require authentication.

Protected routes use an authentication utility before allowing access to certain pages.

This pattern was used to practice separating public application routes from authenticated application functionality.

## Data Loading

React Router loaders are used to retrieve data before rendering specific routes.

This allows route components to receive the data they need without manually coordinating every data request through component state.

The project also uses route actions for form-related interactions such as login.

## Mock API

MirageJS provides a mock API environment for development.

This allows the frontend to behave as though it were communicating with a backend API while keeping the project self-contained.

## What I Learned

Building VanLife gave me practical experience with:

* React Router's data APIs
* Nested routing
* Dynamic routes
* Route loaders
* Route actions
* Protected routes
* Authentication flows
* Error handling
* Mock API development
* Reusable React components
* Responsive frontend development

## Future Improvements

Potential improvements include:

* Replace the mock API with a production backend
* Add persistent user accounts
* Add real van booking functionality
* Add payment processing
* Add host CRUD functionality
* Add image uploads
* Add booking history
* Add availability calendars
* Add improved form validation

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Kingz00/Full-Stack-Developer-Projects.git

cd "Full-Stack-Developer-Projects/VanLife"
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

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

## Screenshots

Homepage
<img width="549" height="574" alt="vanlife-intro-page" src="https://github.com/user-attachments/assets/46e9d801-a3f1-4f8e-92d5-8287c4a558b4" />

Van Listing
<img width="549" height="1452" alt="vanlife-product-list" src="https://github.com/user-attachments/assets/48103dd2-5844-4d70-95d0-1860c8f7e4ce" />

Van Detail Page
<img width="549" height="1260" alt="vanlife-product-detail" src="https://github.com/user-attachments/assets/ac843205-4f91-483a-8e68-f5c126914635" />

Host Dashboard
<img width="548" height="1096" alt="vanlife-host-page" src="https://github.com/user-attachments/assets/cafeac4f-1513-441d-a656-2af65dca83ec" />


## Live Demo

[View on Netlify](https://kingz-vanlife-project.netlify.app/)

## Repository

[View the source code on GitHub](https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/VanLife)
