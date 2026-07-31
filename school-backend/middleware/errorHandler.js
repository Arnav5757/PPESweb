const errorHandler = (err, req, res, next) => {
  // Log detailed error on the server
  console.error("Centralized Error Handler caught:", err);
  
  const statusCode = err.statusCode || err.status || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  
  // Mask operational, database, and filesystem details
  let safeMessage = "An unexpected error occurred on the server";
  
  // Allow user validation errors or marked public errors to pass through
  if (err.isPublic || statusCode < 500) {
    safeMessage = err.message || safeMessage;
  }

  // Double check to ensure no connection secrets leak in messages
  if (typeof safeMessage === "string") {
    safeMessage = safeMessage.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  }

  res.status(statusCode).json({
    success: false,
    message: safeMessage
  });
};

module.exports = errorHandler;
