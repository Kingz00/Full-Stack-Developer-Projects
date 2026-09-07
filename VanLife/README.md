# VanLife

VanLife is a responsive van-rental web application built with **React** and **React Router**.

Users can browse and filter available vans, view individual van details, create an account, log in, and access a protected host dashboard for managing their van collection.

## Overview

VanLife was originally built to explore modern React Router patterns and has since been expanded with **Firebase Authentication**, **Cloud Firestore**, improved authentication flows, responsive UI polish, and more robust loading, error, and empty states.

The application contains two main experiences:

- A customer-facing van rental interface
- An authenticated host dashboard

The application uses **Firebase Authentication and Cloud Firestore** for authentication and application data.

## Features

### Customer Experience

- Browse available vans
- Filter vans by type
- View individual van details
- Create a user account
- Log in and log out
- Responsive navigation
- Loading states
- Error states
- Empty states for unavailable filter results

### Host Dashboard

Authenticated hosts can access:

- Dashboard
- Income information
- Reviews
- Host van listings
- Individual host van information
- Van pricing information
- Van photos

Host routes are protected and require authentication.

Host van ownership is also verified against the authenticated user's Firestore data before host-specific van information is displayed.

## Authentication & Data

VanLife uses **Firebase Authentication** for user registration and login and **Cloud Firestore** for application data.

When a user registers:

1. Firebase Authentication creates the account.
2. The user's profile is updated with their display name.
3. A corresponding user document is created in Firestore.
4. The user can access the protected host experience.

Firestore stores the application's van catalogue as well as user and host-van data.

Firestore security rules ensure that authenticated users can only access their own user and host-van data.

## Tech Stack

### Frontend

- React
- React Router DOM
- React Icons
- CSS
- JavaScript

### Authentication & Data

- Firebase Authentication
- Cloud Firestore
- React Router loaders
- React Router actions

### Development

- Vite
- npm
- Environment variables

## Application Architecture

The application uses React Router's data-router APIs with nested and dynamic routes.

A simplified route structure is:

```text
/
├── Home
├── About
├── Login
├── Register
├── Vans
│   └── Vans/:id
│
└── Host
    ├── Dashboard
    ├── Income
    ├── Reviews
    └── Vans
        └── Vans/:id
            ├── Info
            ├── Pricing
            └── Photos
```

Nested routes allow related pages to share layouts and routing context while dynamic route parameters are used for individual van pages.

## React Router

One of the primary goals of the project was to gain practical experience with React Router's data APIs.

The application uses:

- `createBrowserRouter`
- `createRoutesFromElements`
- Nested routes
- Dynamic route parameters
- Route loaders
- Route actions
- Protected routes
- Error elements

For example, customer van detail pages use:

```text
/vans/:id
```

while host van pages use:

```text
/host/vans/:id
/host/vans/:id/pricing
/host/vans/:id/photos
```

This routing structure keeps related functionality organized while allowing each route to load and handle its own data.

## Authentication & Protected Routes

The host dashboard is protected using Firebase Authentication.

Unauthenticated users cannot access protected host functionality.

The application also checks the authenticated user's identity when working with host-specific Firestore data. This ensures that a user can only access the host-van records associated with their own account.

Firestore security rules reinforce this ownership model at the database level.

## Data Loading

React Router loaders are used to retrieve data before rendering specific routes.

The application retrieves its data from **Cloud Firestore**, with route loaders handling data retrieval for the relevant pages.

Route actions handle form-related operations such as authentication.

This approach keeps data loading and mutations closely associated with the routes that use them instead of managing every request through component-level state.

## UI & Responsive Design

The interface was designed to provide a consistent experience across desktop, tablet, and mobile screen sizes.

The project includes dedicated:

- Loading states
- Error states
- Empty states
- Responsive layouts
- Authentication forms
- Navigation and mobile navigation
- Van listing and detail views
- Host dashboard views

The authentication pages use a compact, consistent form treatment, while the broader application maintains a responsive layout across customer and host experiences.

## What I Learned

Building and refining VanLife gave me practical experience with:

- React Router's data APIs
- Nested routing
- Dynamic routes
- Route loaders
- Route actions
- Protected routes
- Firebase Authentication
- Cloud Firestore
- Firestore security rules
- Authentication flows
- Asynchronous data handling
- Error and loading states
- Responsive frontend development
- Reusable React components

## Future Improvements

Potential future improvements include:

- Add full host CRUD functionality
- Add real van booking functionality
- Add payment processing
- Add image uploads
- Add booking history
- Add availability calendars
- Expand form validation
- Add more comprehensive user profile functionality

## Getting Started

### Prerequisites

- Node.js
- npm
- Firebase project

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

Configure the required Firebase environment variables, then start the development server:

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

*Homepage*

<img width="1143" height="954" alt="vanlife-intro-page" src="https://github.com/user-attachments/assets/fb18a287-a37e-49b5-8147-730056fab0aa" />


*Van Listing*

<img width="1138" height="946" alt="vanlife-product-list" src="https://github.com/user-attachments/assets/29e41f88-5ae0-44dd-a40c-59d43728c404" />


*Van Detail Page*

<img width="1142" height="955" alt="vanlife-product-detail" src="https://github.com/user-attachments/assets/98da6b0c-cf3c-4714-8e1d-4f2c53ea271d" />


*Host Dashboard*

<img width="1138" height="949" alt="vanlife-host-dashboard" src="https://github.com/user-attachments/assets/73050018-3fa0-458a-bf0b-9909f8177647" />

*Host Van Detail Page*

<img width="1136" height="945" alt="vanlife-host-van-detail-page" src="https://github.com/user-attachments/assets/13d615bb-c688-486b-a025-4e90b9195a16" />


## Live Demo

[View on Netlify](https://kingz-vanlife-project.netlify.app/)

## Repository

[View the source code on GitHub](https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/VanLife)
