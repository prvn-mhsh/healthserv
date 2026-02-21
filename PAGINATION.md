# Pagination Implementation

## Overview
Pagination is now centralized and standardized across all endpoints using the `getPaginationParams` utility function.

## Usage

### Query Parameters
Clients should send pagination parameters in the query string:
- `page` - Current page number (default: 1, minimum: 1)
- `limit` - Items per page (default: 10, minimum: 1)

### Example Requests
```
GET /admin/articles?page=1&limit=20
GET /doctor/articles?page=2&limit=15
GET /articles?page=1&limit=10
```

### Response Format
All paginated endpoints return a consistent format:
```json
{
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5,
  "items": [...]
}
```

## Implementation Details

### Controller Level
Controllers use the pagination utility:

```javascript
const { getPaginationParams, formatPaginatedResponse } = require('../utils/pagination');

// In controller function:
const { page, limit, offset } = getPaginationParams(req.query, 10); // 10 is default limit

// Fetch data
const total = await repo.countArticles(filters);
const articles = await repo.getArticles(filters, limit, offset);

// Return formatted response
res.json(formatPaginatedResponse(articles, total, page, limit));
```

### Utility Functions

#### `getPaginationParams(query, defaultLimit = 10)`
- Parses and validates `page` and `limit` from query parameters
- Returns: `{ page, limit, offset }`
- Automatically handles invalid values and defaults

#### `formatPaginatedResponse(items, total, page, limit)`
- Formats paginated data into a consistent response structure
- Calculates `totalPages` automatically
- Returns: `{ page, limit, total, totalPages, items }`

## Migration Notes
- Changed from `perPage` to `limit` for query parameter consistency
- Response field changed from `articles` to `items` for consistency
- All calculations moved to utility functions to reduce code duplication
