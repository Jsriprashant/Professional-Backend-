class apiError extends Error {
    // overriding the base class constructor
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        statck = ""
    ) {

        super(message) // call to super class constructor
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (statck) {
            this.stack = statck
        }
        else {
            Error.captureStackTrace(this, this.constructor)
        }


    }
}

export { apiError }