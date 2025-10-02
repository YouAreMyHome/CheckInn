class ApiResponse {
  constructor(success, statusCode, message, data = null, meta = null) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    return res.status(statusCode).json(
      new ApiResponse(true, statusCode, message, data, meta)
    );
  }

  static error(res, statusCode = 500, message = 'Internal Server Error', data = null) {
    return res.status(statusCode).json(
      new ApiResponse(false, statusCode, message, data)
    );
  }

  static created(res, message = 'Created successfully', data = null) {
    return this.success(res, 201, message, data);
  }

  static updated(res, message = 'Updated successfully', data = null) {
    return this.success(res, 200, message, data);
  }

  static deleted(res, message = 'Deleted successfully') {
    return this.success(res, 200, message);
  }

  static notFound(res, message = 'Resource not found') {
    return this.error(res, 404, message);
  }

  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, 401, message);
  }

  static forbidden(res, message = 'Forbidden access') {
    return this.error(res, 403, message);
  }

  static badRequest(res, message = 'Bad request', data = null) {
    return this.error(res, 400, message, data);
  }

  static paginated(res, data, pagination, message = 'Data retrieved successfully') {
    const meta = {
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNext: pagination.page < pagination.totalPages,
        hasPrev: pagination.page > 1
      }
    };
    return this.success(res, 200, message, data, meta);
  }
}

// Backward compatibility
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString()
  });
};

module.exports = { ApiResponse, sendResponse };
