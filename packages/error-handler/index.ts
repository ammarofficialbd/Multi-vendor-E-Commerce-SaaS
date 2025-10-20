export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly details?: Record<string, unknown>;
    public readonly service?: string;

    constructor(
        message: string,
        statusCode: number,
        isOperational: boolean = true,
        details?: Record<string, unknown>,
        service?: string
    ) {
        super(message);
        Object.setPrototypeOf(this, AppError.prototype);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        this.service = service;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: {
                message: this.message,
                statusCode: this.statusCode,
                details: this.details || null,
                service: this.service || 'unknown',
                stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
            },
        };
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Request Not Found", service?: string) {
        super(message, 404, true, undefined, service);
    }
}

export class ValidationError extends AppError {
    constructor(message = "Invalid Request Data", details?: Record<string, unknown>, service?: string) {
        super(message, 400, true, details, service);
    }
}

export class AuthError extends AppError {
    constructor(message = "Unauthorized", service = "auth") {
        super(message, 401, true, undefined, service);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "Forbidden: Access Denied", service?: string) {
        super(message, 403, true, undefined, service);
    }
}

export class DatabaseError extends AppError {
    constructor(message = "Database Error", details?: Record<string, unknown>, service = "database") {
        super(message, 500, false, details, service);
    }
}

export class RateLimitError extends AppError {
    constructor(message = "Too Many Requests", details?: Record<string, unknown>, service?: string) {
        super(message, 429, true, details, service);
    }
}