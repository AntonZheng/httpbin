const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAPI spec definition
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'httpbin-debug',
      version: '1.0.0',
      description: 'HTTP Request & Response Service for debugging HTTP calls. Use as an origin to inspect how CDN functions, proxies, and middleware transform requests and responses.'
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Local' }
    ]
  },
  apis: [__filename]
});

// Middleware
app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.raw({ limit: '10mb' }));
app.use(bodyParser.text({ limit: '10mb' }));

// Swagger UI at /docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'httpbin-debug API',
  swaggerOptions: { displayRequestDuration: true, filter: true }
}));

// Serve raw OpenAPI spec
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

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

/**
 * @openapi
 * components:
 *   schemas:
 *     RequestData:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *         method:
 *           type: string
 *         url:
 *           type: string
 *         path:
 *           type: string
 *         protocol:
 *           type: string
 *         hostname:
 *           type: string
 *         ip:
 *           type: string
 *         headers:
 *           type: object
 *         query:
 *           type: object
 *         params:
 *           type: object
 *         body:
 *           type: object
 *         userAgent:
 *           type: string
 *         contentType:
 *           type: string
 *         host:
 *           type: string
 *         origin:
 *           type: string
 */

/**
 * @openapi
 * /:
 *   get:
 *     summary: Service info and endpoint listing
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: JSON listing of all available endpoints
 */
// Root endpoint - shows service info
app.get('/', (req, res) => {
  res.json({
    message: 'HTTP Request & Response Service',
    description: 'A simple service inspired by httpbin for debugging HTTP requests',
    docs: '/docs',
    openapi: '/openapi.json',
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

/**
 * @openapi
 * /get:
 *   get:
 *     summary: Returns GET request data as seen by the origin
 *     tags: [HTTP Methods]
 *     responses:
 *       200:
 *         description: Full request echo including headers, query params, IP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 */
// Specific method endpoints
app.get('/get', (req, res) => {
  res.json(formatRequestData(req));
});

/**
 * @openapi
 * /post:
 *   post:
 *     summary: Returns POST request data including body
 *     tags: [HTTP Methods]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Full request echo with body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 */
app.post('/post', (req, res) => {
  res.json(formatRequestData(req));
});

/**
 * @openapi
 * /put:
 *   put:
 *     summary: Returns PUT request data including body
 *     tags: [HTTP Methods]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Full request echo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 */
app.put('/put', (req, res) => {
  res.json(formatRequestData(req));
});

/**
 * @openapi
 * /delete:
 *   delete:
 *     summary: Returns DELETE request data
 *     tags: [HTTP Methods]
 *     responses:
 *       200:
 *         description: Full request echo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 */
app.delete('/delete', (req, res) => {
  res.json(formatRequestData(req));
});

/**
 * @openapi
 * /patch:
 *   patch:
 *     summary: Returns PATCH request data including body
 *     tags: [HTTP Methods]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Full request echo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 */
app.patch('/patch', (req, res) => {
  res.json(formatRequestData(req));
});

/**
 * @openapi
 * /headers:
 *   get:
 *     summary: Returns only the request headers
 *     tags: [Inspection]
 *     responses:
 *       200:
 *         description: Request headers object
 */
// Headers endpoint
app.all('/headers', (req, res) => {
  res.json({
    headers: req.headers
  });
});

/**
 * @openapi
 * /ip:
 *   get:
 *     summary: Returns the client's IP address (respects X-Forwarded-For)
 *     tags: [Inspection]
 *     responses:
 *       200:
 *         description: Client origin IP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 origin:
 *                   type: string
 *                   example: "203.0.113.42"
 */
// IP endpoint
app.all('/ip', (req, res) => {
  res.json({
    origin: getClientIP(req)
  });
});

/**
 * @openapi
 * /user-agent:
 *   get:
 *     summary: Returns the client's User-Agent header
 *     tags: [Inspection]
 *     responses:
 *       200:
 *         description: User-Agent string
 */
// User-Agent endpoint
app.all('/user-agent', (req, res) => {
  res.json({
    'user-agent': req.headers['user-agent']
  });
});

/**
 * @openapi
 * /json:
 *   post:
 *     summary: Echoes back JSON body with headers and method
 *     tags: [HTTP Methods]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Echoed JSON body with request metadata
 */
// JSON endpoint - echoes back JSON data
app.all('/json', (req, res) => {
  res.json({
    json: req.body,
    headers: req.headers,
    method: req.method
  });
});

/**
 * @openapi
 * /status/{code}:
 *   get:
 *     summary: Returns the specified HTTP status code
 *     tags: [Status Codes]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 100
 *           maximum: 599
 *         description: HTTP status code to return (100-599)
 *     responses:
 *       200:
 *         description: Response with requested status code
 *       400:
 *         description: Invalid status code
 */
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

/**
 * @openapi
 * /delay/{seconds}:
 *   get:
 *     summary: Delays response by N seconds (max 10)
 *     description: Useful for testing timeouts, CDN caching behavior, and retry logic
 *     tags: [Dynamic]
 *     parameters:
 *       - in: path
 *         name: seconds
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Seconds to delay (max 10)
 *     responses:
 *       200:
 *         description: Delayed response with request data
 *       400:
 *         description: Delay exceeds maximum
 */
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

/**
 * @openapi
 * /anything/{path}:
 *   get:
 *     summary: Accepts any method and path, returns full request data
 *     description: Catch-all endpoint useful for testing how CDN/proxy modifies requests
 *     tags: [Anything]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: false
 *         schema:
 *           type: string
 *         description: Any path segment
 *     responses:
 *       200:
 *         description: Full request echo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 *   post:
 *     summary: Accepts any method and path, returns full request data
 *     tags: [Anything]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Full request echo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RequestData'
 */
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
  console.log(`📖 API Docs: http://localhost:${PORT}/docs`);
  console.log(`📡 OpenAPI spec: http://localhost:${PORT}/openapi.json`);
  console.log(`🔍 Send requests to any endpoint to debug your HTTP calls`);
});

module.exports = app;