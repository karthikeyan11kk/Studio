
// AppError class definition
class AppError extends Error
{
   // AppError constructor
   constructor(message, status)
   { 
      // Call the parent constructor with the provided message
      super(message);

      // Set the status property to the provided status
      this.status = status;

      // Set the message property to the provided message
      this.message = message;
   }
}

// Export the AppError class
module.exports = AppError;
