export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        error:
            statusCode === 500
                ? 'An unexpected error occurred. Please try again.'
                : err.message
    })
}

export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message)

        this.statusCode = statusCode
        this.isOperational = true
    }
}