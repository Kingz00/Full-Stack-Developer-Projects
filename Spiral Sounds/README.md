# Spiral Sounds

Spiral Sounds is a full-stack online vinyl record store built with Node.js, Express, SQLite, and JavaScript.

The application provides a product catalog, product search, genre filtering, user authentication, and a persistent shopping cart.

## Overview

Spiral Sounds was built to explore full-stack web development using a Node.js and Express backend connected to a SQLite database.

The application exposes REST-style API endpoints for products, authentication, user information, and shopping-cart operations.

The frontend consumes these endpoints to provide an e-commerce experience for browsing and purchasing vinyl records.

## Features

### Product Catalog

* Browse vinyl records
* Search products
* Filter products by genre
* Retrieve product information
* Display product information through the storefront

### Authentication

* User registration
* User login
* User logout
* Session-based authentication
* Password hashing with bcrypt
* Current-user endpoint

### Shopping Cart

* Add products to the cart
* Increase product quantities
* Retrieve cart contents
* Calculate cart totals
* Remove products from the cart
* Clear the cart

## Tech Stack

### Backend

* Node.js
* Express
* JavaScript
* REST APIs

### Database

* SQLite
* `sqlite3`
* `sqlite`

### Authentication

* `express-session`
* `bcryptjs`
* HTTP-only cookies

### Validation / Configuration

* Validator
* dotenv

## API Structure

The Express server exposes several API areas:

```text
/api/products
/api/auth
/api/auth/me
/api/cart
```

### Products

The products API handles retrieving and filtering the vinyl catalog.

Example:

```text
GET /api/products
```

The product functionality supports catalog retrieval and product discovery based on available product information.

### Authentication

Authentication endpoints are grouped under:

```text
/api/auth
```

The application also exposes:

```text
/api/auth/me
```

for retrieving information about the currently authenticated user.

### Cart

Shopping-cart operations are grouped under:

```text
/api/cart
```

These endpoints handle adding, retrieving, updating, and removing cart items.

## Authentication Flow

User passwords are not stored directly.

During registration, passwords are processed using `bcryptjs`.

After authentication, Express sessions are used to maintain the user's logged-in state.

The server configures session cookies with HTTP-only behavior to prevent client-side JavaScript from directly accessing the session cookie.

## Database

SQLite is used as the application's relational database.

The project contains dedicated database, SQL, controller, middleware, and route directories:

```text
Spiral Sounds
├── controllers/
├── db/
├── middleware/
├── routes/
├── sql/
├── public/
├── server.js
└── database.db
```

This structure separates API routing, application logic, database access, and middleware responsibilities.

## What I Learned

Building Spiral Sounds gave me practical experience with:

* Node.js
* Express
* REST API design
* SQLite
* Database-driven applications
* User authentication
* Password hashing
* Session management
* HTTP-only cookies
* API routing
* Shopping-cart logic
* CRUD operations
* Backend project structure

## Security Considerations

This project was created as a learning application and is not intended to be used as-is in a production environment.

Before deploying a production version, several areas would need additional hardening, including:

* Secure production session configuration
* HTTPS-only cookies
* CSRF protection
* Production-grade session storage
* Input validation and sanitization
* Rate limiting
* Secure secret management
* Production database configuration

## Future Improvements

Potential improvements include:

* Product detail pages
* Order processing
* Checkout functionality
* Payment integration
* User order history
* Product reviews
* Admin product management
* Inventory management
* Production-grade session storage
* Improved API validation and security

## Getting Started

### Prerequisites

* Node.js
* npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Kingz00/Full-Stack-Developer-Projects.git

cd "Full-Stack-Developer-Projects/Spiral Sounds"
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`.

At minimum, configure the session secret:

```env
SESSION_SECRET=your-secret-here
```

Do not commit your `.env` file to the repository.

### Start the Server

```bash
npm start
```

The server runs on:

```text
http://localhost:8000
```

## Screenshots

*Product Catalog*

<img width="1891" height="1067" alt="spiral-sounds-product-list" src="https://github.com/user-attachments/assets/464f79fc-c0ba-4aa7-9a6d-ccde2398cc58" />

*Authentication Screen*

<img width="1909" height="688" alt="spiral-sounds-auth-screen" src="https://github.com/user-attachments/assets/11e1114b-9709-4767-a2be-273d467ae223" />


*Shopping Cart*

<img width="1900" height="687" alt="spiral-sounds-shopping-cart" src="https://github.com/user-attachments/assets/26d674b8-dacf-4ec8-883f-678f6594dc0b" />



## Live Demo

*Add your deployed application URL here.*

## Repository

[View the source code on GitHub](https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Spiral%20Sounds)
