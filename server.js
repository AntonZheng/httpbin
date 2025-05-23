const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.raw({ limit: '10mb' }));
app.use(bodyParser.text({ limit: '10mb' }));

// Helper function to get client IP
function getClientIP(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// Helper function to format request data
function formatRequestData(req) {
  const data = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    path: req.path,
    protocol: req.protocol,
    hostname: req.hostname,
    ip: getClientIP(req),
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
    cookies: req.cookies || {},
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    host: req.headers['host'],
    origin: req.headers['origin'],
    referer: req.headers['referer']
  };

  // Only include body if it exists and is not empty
  if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0)) {
    delete data.body;
  }

  return data;
}

// Root endpoint - shows service info
app.get('/', (req, res) => {
  res.json({
    message: 'HTTP Request & Response Service',
    description: 'A simple service inspired by httpbin for debugging HTTP requests',
    endpoints: {
      '/anything/*': 'Accepts any HTTP method and returns request details',
      '/get': 'Returns GET request details',
      '/post': 'Returns POST request details',
      '/put': 'Returns PUT request details',
      '/delete': 'Returns DELETE request details',
      '/patch': 'Returns PATCH request details',
      '/status/:code': 'Returns specified HTTP status code',
      '/delay/:seconds': 'Delays response by specified seconds',
      '/headers': 'Returns request headers only',
      '/ip': 'Returns client IP address',
      '/user-agent': 'Returns client User-Agent',
      '/json': 'Returns JSON data from request body'
    },
    usage: 'Send any HTTP request to any endpoint to see the request details',
    timestamp: new Date().toISOString()
  });
});

// Specific method endpoints
app.get('/get', (req, res) => {
  res.json(formatRequestData(req));
});

app.post('/post', (req, res) => {
  res.json(formatRequestData(req));
});

app.put('/put', (req, res) => {
  res.json(formatRequestData(req));
});

app.delete('/delete', (req, res) => {
  res.json(formatRequestData(req));
});

app.patch('/patch', (req, res) => {
  res.json(formatRequestData(req));
});

// Headers endpoint
app.all('/headers', (req, res) => {
  res.json({
    headers: req.headers
  });
});

// IP endpoint
app.all('/ip', (req, res) => {
  res.json({
    origin: getClientIP(req)
  });
});

// User-Agent endpoint
app.all('/user-agent', (req, res) => {
  res.json({
    'user-agent': req.headers['user-agent']
  });
});

// JSON endpoint - echoes back JSON data
app.all('/json', (req, res) => {
  res.json({
    json: req.body,
    headers: req.headers,
    method: req.method
  });
});

// Status code endpoint
app.all('/status/:code', (req, res) => {
  const statusCode = parseInt(req.params.code);
  if (statusCode >= 100 && statusCode < 600) {
    res.status(statusCode).json({
      status: statusCode,
      message: `HTTP ${statusCode}`,
      request: formatRequestData(req)
    });
  } else {
    res.status(400).json({
      error: 'Invalid status code',
      message: 'Status code must be between 100 and 599'
    });
  }
});

// Delay endpoint
app.all('/delay/:seconds', (req, res) => {
  const delay = parseInt(req.params.seconds) || 0;
  const maxDelay = 10; // Maximum 10 seconds delay
  
  if (delay > maxDelay) {
    return res.status(400).json({
      error: `Delay too long. Maximum delay is ${maxDelay} seconds`
    });
  }
  
  setTimeout(() => {
    res.json({
      delay: delay,
      message: `Delayed response by ${delay} seconds`,
      request: formatRequestData(req)
    });
  }, delay * 1000);
});

// Catch-all endpoint for /anything/* - accepts any method
app.all('/anything/*', (req, res) => {
  res.json(formatRequestData(req));
});

app.all('/anything', (req, res) => {
  res.json(formatRequestData(req));
});

// Generic catch-all for debugging any other path
app.all('*', (req, res) => {
  const data = formatRequestData(req);
  data.note = 'This endpoint accepts any HTTP method and path for debugging purposes';
  res.json(data);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HTTP Request & Response Service running on port ${PORT}`);
  console.log(`📡 Visit http://localhost:${PORT} to see available endpoints`);
  console.log(`🔍 Send requests to any endpoint to debug your HTTP calls`);
});

module.exports = app;