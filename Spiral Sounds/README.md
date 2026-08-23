# Spiral Sounds

Spiral Sounds is a full-stack vinyl record store built with JavaScript, Node.js, Express, and SQLite.

Originally built as part of my Full Stack Developer learning path, I revisited the project to identify limitations in the original implementation and improved its architecture, security, database integrity, inventory handling, checkout flow, and user experience.

The application now supports product discovery, session-based authentication, inventory-aware shopping carts, transactional checkout, persistent orders, and order history.

## Project Improvements

This version of Spiral Sounds focuses on improving the original application's reliability, security, data integrity, and business logic.

### Backend & Architecture

- Database initialization and seeding moved to application startup.
- Centralized error-handling middleware for unexpected server errors.
- Environment-aware session configuration for development and production.
- Required environment configuration validated at startup.
- SQLite foreign-key enforcement enabled.
- Database constraints added to protect core data integrity.

### Authentication & Security

- Registration input validation and normalization.
- Password hashing with `bcryptjs`.
- Duplicate email and username detection.
- Session-based authentication.
- HTTP-only session cookies.
- Secure production session cookies.
- Authentication middleware for protected resources.
- User-specific authorization for order history.

### Cart & Checkout

- Inventory-aware cart quantities.
- Server-side stock validation.
- Server-side price calculation.
- Transactional checkout with rollback handling.
- Inventory updates performed as part of the checkout transaction.
- Cart cleared only after a successful order.
- Persistent orders and order items.
- Historical purchase prices stored with order items.

### API & Frontend

- Composable product search and genre filtering.
- Meaningful HTTP status codes for API errors.
- Consistent frontend handling of loading and error states.
- Visual feedback for inventory conflicts.
- Protection against duplicate checkout submissions.
- User order-history page.

## Features

### Product Catalog

- Browse vinyl records.
- Search products by genre, artist, or title.
- Filter products by genre.
- Combine search and genre filters.
- Display product information through the storefront.

### Authentication

- User registration.
- User login and logout.
- Session-based authentication.
- Password hashing with `bcryptjs`.
- Input validation and normalization.
- Duplicate email and username detection.
- Current-user endpoint.

### Shopping Cart

- Add products to the cart.
- Increase product quantities.
- Prevent quantities from exceeding available stock.
- Retrieve cart contents.
- Calculate cart totals.
- Remove individual items.
- Clear the cart.
- Display inventory-related feedback.

### Checkout & Orders

- Server-side checkout.
- Server-side price calculation.
- Inventory validation during checkout.
- Transactional order creation.
- Automatic inventory reduction.
- Cart clearing after successful checkout.
- Persistent order records.
- Historical order-item prices.
- User-specific order history.

### Frontend Experience

- Loading states.
- API error feedback.
- Authentication-aware navigation.
- Checkout processing state.
- Empty-cart and empty-order states.
- Responsive layout.

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

The Express server exposes API endpoints for products, authentication, shopping carts, and orders.

### Products

`/api/products`

Handles retrieving and filtering the vinyl catalog.

Examples:

- `GET /api/products`
- `GET /api/products?genre=indie`
- `GET /api/products?search=echoes`
- `GET /api/products?genre=indie&search=echoes`
- `GET /api/products/genres`

### Authentication

`/api/auth`

Handles user authentication and session management.

Examples:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Cart

`/api/cart`

Handles authenticated shopping-cart operations.

Examples:

- `POST /api/cart/add`
- `GET /api/cart`
- `GET /api/cart/cart-count`
- `DELETE /api/cart/:itemId`
- `DELETE /api/cart/all`

### Orders

`/api/orders`

Handles authenticated checkout and order history.

Examples:

- `POST /api/orders`
- `GET /api/orders`

## Authentication Flow

User passwords are not stored directly.

During registration, passwords are processed using `bcryptjs`.

After authentication, Express sessions are used to maintain the user's logged-in state.

The server configures session cookies with HTTP-only behavior to prevent client-side JavaScript from directly accessing the session cookie.

## Database

SQLite is used as the application's relational database.

The database is initialized when the application starts. Required tables are created if they do not already exist, and the product catalog is seeded when the products table is empty.

The database contains:

- `users` — registered user accounts.
- `products` — vinyl catalog and inventory.
- `cart_items` — authenticated users' shopping carts.
- `orders` — completed orders.
- `order_items` — products and purchase-price snapshots belonging to orders.

The generated SQLite database file is excluded from version control. The database initialization and seed logic are the source of truth for recreating the database.

## Authentication & Security

Authentication is implemented using server-side sessions.

### Authentication

- User passwords are hashed using `bcryptjs`.
- Registration input is validated and normalized.
- Email addresses are normalized before storage.
- Duplicate email addresses and usernames are rejected.
- Protected resources use authentication middleware.
- Order history is restricted to the authenticated user.

### Session Security

- Session cookies are HTTP-only.
- `SameSite=Lax` is enabled.
- Session cookies use `Secure` in production.
- Express trusts the Render proxy in production so secure requests are handled correctly.
- `SESSION_SECRET` is supplied through environment configuration and validated during application startup.

### Error Handling

Unexpected errors are handled centrally by Express middleware rather than exposing internal error details to clients.

Expected application errors use appropriate HTTP status codes such as:

- `400 Bad Request`
- `401 Unauthorized`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`

## Architecture

The application follows a simple layered structure:

```text
Browser
   │
   │ HTTP requests
   ▼
Express Server
   │
   ├── Routes
   │
   ├── Authentication Middleware
   │
   ├── Controllers
   │
   ├── Centralized Error Handling
   │
   ▼
SQLite Database
   │
   ├── users
   ├── products
   ├── cart_items
   ├── orders
   └── order_items
```

### Checkout Flow

Checkout is handled entirely on the server.

```text
Cart
  ↓
POST /api/orders
  ↓
Retrieve user's cart
  ↓
Validate current inventory
  ↓
Calculate total using database prices
  ↓
BEGIN TRANSACTION
  ↓
Create order
  ↓
Create order items
  ↓
Decrease product stock
  ↓
Clear cart
  ↓
COMMIT
```


## What I Learned From Revisiting the Project

Revisiting Spiral Sounds after gaining more full-stack development experience highlighted the difference between making an application work and designing it to handle real-world conditions.

Key lessons included:

- Keep business rules on the server rather than trusting client-side validation.
- Use database transactions when multiple related operations must succeed together.
- Use database constraints as a second layer of protection for application-level rules.
- Separate expected application errors from unexpected server errors.
- Treat authentication and resource authorization as separate concerns.
- Make development and production configuration environment-aware.
- Design API responses and HTTP status codes around meaningful application outcomes.
- Test backend behavior independently before integrating it with the frontend.


## Security & Production Considerations

The project includes several production-oriented security and reliability measures:

- Passwords are hashed using `bcryptjs`.
- Session cookies are HTTP-only.
- Session cookies use `SameSite=Lax`.
- Session cookies are marked `Secure` in production.
- Express is configured to trust the Render proxy in production.
- Required session configuration is validated at startup.
- Protected resources use authentication middleware.
- Order history is scoped to the authenticated user.
- SQL queries use parameterized statements.
- SQLite foreign-key enforcement is enabled.
- Database constraints protect key business rules.
- Unexpected server errors return generic error messages.

### Known Limitations

This remains a portfolio/learning application rather than a production e-commerce platform.

Known limitations include:

- Express's default in-memory session store is not suitable for a horizontally scaled deployment.
- No real payment provider is integrated.
- No administrative product-management interface exists.
- CSRF protection beyond the `SameSite=Lax` cookie configuration has not been implemented.
- The SQLite database is appropriate for this project but would not be the preferred database architecture for a larger multi-instance e-commerce application.

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

If required by your environment, e.g. Render, configure:

```env
DATABASE_PATH=path/to/database.db
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

## Testing

Backend API behavior was tested independently using Thunder Client.

Testing covered:

- User registration and login.
- Authentication and protected routes.
- Product filtering.
- Cart operations.
- Inventory limits.
- Invalid product and cart IDs.
- Transactional checkout.
- Insufficient-stock rollback.
- Order creation.
- Order history.
- User-specific order authorization.
- Unauthenticated requests.
- Frontend checkout and error states.

## Screenshots

*Product Catalog*

<img width="1891" height="1067" alt="spiral-sounds-product-list" src="https://github.com/user-attachments/assets/464f79fc-c0ba-4aa7-9a6d-ccde2398cc58" />

*Authentication Screen*

<img width="1909" height="688" alt="spiral-sounds-auth-screen" src="https://github.com/user-attachments/assets/11e1114b-9709-4767-a2be-273d467ae223" />


*Shopping Cart*

<img width="1900" height="687" alt="spiral-sounds-shopping-cart" src="https://github.com/user-attachments/assets/26d674b8-dacf-4ec8-883f-678f6594dc0b" />

*Order History*

<img width="1126" height="855" alt="spiral-sounds-orders-history" src="https://github.com/user-attachments/assets/b3b49807-3a3a-4d09-95d3-f3c025378c97" />


## Deployment

The application is deployed on Render.

The production environment uses:

- `NODE_ENV=production`
- Environment-provided session configuration
- HTTPS
- Environment-aware secure session cookies
- SQLite database initialization at application startup

## Live Demo

[View on Render](https://spiral-sounds-408t.onrender.com)

## Repository

[View the source code on GitHub](https://github.com/Kingz00/Full-Stack-Developer-Projects/tree/main/Spiral%20Sounds)
