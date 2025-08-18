const mobileResponse = (req, res, next) => {
  // Add mobile-friendly response helper
  res.success = (data, message = 'Success') => {
    res.json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  };

  res.error = (message, statusCode = 400, errors = null) => {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  };

  next();
};

module.exports = mobileResponse;