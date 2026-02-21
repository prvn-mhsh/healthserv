const { logger } = require('@emedihub/observability-backend');

/**
 * Parse and validate pagination parameters from query
 * @param {Object} query - Request query object
 * @param {number} defaultLimit - Default items per page (default: 10)
 * @returns {Object} { page, limit, offset }
 */
function getPaginationParams(query, defaultLimit = 10) {
  try {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || defaultLimit);
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      offset
    };
  } catch (err) {
    logger.error('Error parsing pagination params', err);
    return {
      page: 1,
      limit: defaultLimit,
      offset: 0
    };
  }
}

/**
 * Format paginated response
 * @param {Array} items - Data items to return
 * @param {number} total - Total count of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Formatted pagination response
 */
function formatPaginatedResponse(items, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    items
  };
}

module.exports = {
  getPaginationParams,
  formatPaginatedResponse
};
