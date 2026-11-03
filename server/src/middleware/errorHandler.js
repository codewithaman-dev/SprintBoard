export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Route not found." });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (process.env.NODE_ENV !== "production") console.error(err);

  const status = err.status || (err.name === "ValidationError" ? 400 : 500);
  const message = status >= 500 ? "Something went wrong. Please try again." : err.message;
  res.status(status).json({ success: false, message });
}
