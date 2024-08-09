const express = require('express'); //เรียกใช้ express ผ่าน require
const { swaggerUi, swaggerDocs } = require('./swagger'); // Import Swagger configuration
const app = express(); //สร้างตัวแปร myApp เพื่อใช้งาน express 
const port = 3000; //พอร์ตของ Server ที่ใช้ในการเปิด Localhost 
const client_id = 'myclient';
const client_secret = 'pclEGbe5Q4FHqEMeTcNPqq3F2WhQG068';
//const REACT_APP_URL = 'http://141.11.33.31:8080';
// const REACT_APP_URL = 'http://localhost:8080';
const REACT_APP_URL = 'http://host.docker.internal:8080'; // or use host IP if on Linux
const cors = require('cors');
const bodyParser = require('body-parser'); // Import body-parser

const { URLSearchParams } = require('url');

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Allow only localhost:3000
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'], // Specify allowed methods
  credentials: true, // Allow credentials if needed
}));
// Set up Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

/**
 * @swagger
 * /check_token:
 *   post:
 *     summary: Check the validity of a token
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         description: The token to check
 *         schema:
 *           type: string
 *       - in: query
 *         name: client_secret
 *         required: true
 *         description: The client secret for validation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with token validation result
 *       400:
 *         description: Bad request if token or client secret is missing or incorrect
 *       500:
 *         description: Internal server error
 */
app.post('/check_token', async (req, res) => {

  console.log('Request Body:', req.body); // Print the entire body to see what's received

  const token = req.body.token; // Get the token from the request body
  const client_secret_input = req.body.client_secret; // Get the client_secret from the request body
  console.log(client_secret_input, client_secret)
  if (!token || !client_secret_input) {
    return res.status(400).json({
      error: 'Token and Client secret are required',
    });
  }
  
  if (client_secret_input != client_secret) {
    return res.status(400).json({
      error: 'Client secret not match',
    });
  }
  const url = `${REACT_APP_URL}/realms/myrealm/protocol/openid-connect/token/introspect/`;
  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('token', token);
  
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  };
  
  try {
    const response = await fetch(url, requestOptions);
    const result = await response.json();
    console.log(result);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
