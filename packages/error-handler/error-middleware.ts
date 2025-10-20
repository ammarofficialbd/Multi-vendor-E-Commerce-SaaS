import { Request, Response } from 'express';
import { AppError, RateLimitError } from './index'; // Adjust path to your error classes file

export const errorHandler = (err: Error, req: Request, res: Response): void => {
    // Handle AppError instances
    if (err instanceof AppError) {
        // Set Retry-After header for RateLimitError
        if (err instanceof RateLimitError && err.details?.retryAfter) {
            res.set('Retry-After', String(err.details.retryAfter));
        }

        // Log non-operational AppError instances (e.g., DatabaseError)
        if (!err.isOperational) {
            console.error('Non-operational error:', {
                message: err.message,
                statusCode: err.statusCode,
                service: err.service || 'unknown',
                details: err.details,
                stack: err.stack,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString(),
            });

            // Optional: Publish to Kafka for centralized logging
            /*
            kafkaProducer.send({
                topic: 'error-logs',
                messages: [{
                    value: JSON.stringify({
                        message: err.message,
                        statusCode: err.statusCode,
                        service: err.service || 'unknown',
                        details: err.details,
                        stack: err.stack,
                        path: req.path,
                        method: req.method,
                        timestamp: new Date().toISOString(),
                    }),
                }],
            });
            */
        }

        // Send response using toJSON() without returning
        res.status(err.statusCode).json(err.toJSON());
        return; // Explicitly return void
    }

    // Handle unexpected errors
    const statusCode = 500;

    res.status(statusCode).json({
        error: {
            message: 'Internal Server Error',
            statusCode,
            details: null,
            service: 'unknown',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
    });

    // Log unexpected errors
    console.error('Unexpected error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    // Optional: Publish to Kafka
    /*
    kafkaProducer.send({
        topic: 'error-logs',
        messages: [{
            value: JSON.stringify({
                message: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString(),
            }),
        }],
    });
    */

    return; // Explicitly return void
};



// my firends code :


export const errMiddleware = (err: Error, req:Request, res: Response) => {
    if(err instanceof AppError){
        console.log(`Error ${req.method} - ${req.url} = ${err.message}`)

        return res.status(err.statusCode).json(err.toJSON())
    }


    return res.status(500).json({
        err : "Something went wrong , please try again"
    })
}