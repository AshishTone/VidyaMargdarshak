function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== "test") {
    console.error(err);
  }

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    details: err.details || undefined,
  });
}

module.exports = { notFound, errorHandler };
