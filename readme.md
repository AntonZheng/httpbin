# HTTP Request & Response Service

A simple Node.js service inspired by httpbin for debugging HTTP requests. This service accepts requests on any path and returns detailed information about what was sent, helping you debug your HTTP calls.

## Features

- 🔍 **Request Debugging**: See all details of your HTTP requests
- 🌐 **All HTTP Methods**: Supports GET, POST, PUT, DELETE, PATCH, and more
- 📡 **Any Path**: Send requests to any endpoint for debugging
- 🎯 **Specific Endpoints**: Dedicated endpoints for common testing scenarios
- ⏱️ **Delay Testing**: Test timeouts with configurable delays
- 🔧 **Status Code Testing**: Return any HTTP status code for testing

## Installation & Setup

```bash
npm install
npm start
```

The service will start on port 3000 (or the port specified in the PORT environment variable).

## Endpoints

### Root Information
- `GET /` - Shows service information and available endpoints

### Method-Specific Endpoints
- `GET /get` - Returns GET request details
- `POST /post` - Returns POST request details  
- `PUT /put` - Returns PUT request details
- `DELETE /delete` - Returns DELETE request details
- `PATCH /patch` - Returns PATCH request details

### Debugging Endpoints
- `ANY /anything` or `/anything/*` - Accepts any method and returns request details
- `ANY /headers` - Returns only request headers
- `ANY /ip` - Returns client IP address
- `ANY /user-agent` - Returns client User-Agent string
- `ANY /json` - Echoes back JSON data from request body

### Testing Endpoints
- `ANY /status/:code` - Returns specified HTTP status code (100-599)
- `ANY /delay/:seconds` - Delays response by specified seconds (max 10s)

### Catch-All
- `ANY /*` - Any other path will return request details for debugging

## Usage Examples

### Basic Request Debugging
```bash
curl http://localhost:3000/anything
```

### Test with Headers and Body
```bash
curl -X POST http://localhost:3000/post \
  -H "Content-Type: application/json" \
  -H "X-Custom-Header: test-value" \
  -d '{"name": "test", "value": 123}'
```

### Test Status Codes
```bash
curl http://localhost:3000/status/404
curl http://localhost:3000/status/500
```

### Test Delays
```bash
curl http://localhost:3000/delay/3
```

### Debug Custom Endpoints
```bash
curl http://localhost:3000/my/custom/path?param=value
```

## Response Format

The service returns detailed information about your request:

```json
{
  "timestamp": "2025-05-23T...",
  "method": "POST",
  "url": "/post?test=1",
  "path": "/post",
  "protocol": "http",
  "hostname": "localhost",
  "ip": "::1",
  "headers": {
    "content-type": "application/json",
    "user-agent": "curl/7.64.1",
    "...": "..."
  },
  "query": {
    "test": "1"
  },
  "body": {
    "name": "test",
    "value": 123
  },
  "userAgent": "curl/7.64.1",
  "contentType": "application/json"
}
```

## Development

The service is built with:
- Express.js for the web framework
- CORS enabled for cross-origin requests
- Body parsing for JSON, URL-encoded, and raw data
- Compression for optimized responses

## License

MIT
