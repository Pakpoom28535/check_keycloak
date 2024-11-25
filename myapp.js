const express = require('express'); //เรียกใช้ express ผ่าน require
const { swaggerUi, swaggerDocs } = require('./swagger'); // Import Swagger configuration
const app = express(); //สร้างตัวแปร myApp เพื่อใช้งาน express 
const port = 3000; //พอร์ตของ Server ที่ใช้ในการเปิด Localhost 
const client_id = 'KpiClient';
const client_secret = 'Exa59cdOnYvaoXu7BRgNqjn5voRmr81n';
const REACT_APP_URL = 'https://keycloak-api.kpimotorway.com';
const cors = require('cors');
const bodyParser = require('body-parser'); 
const Real_name = 'MotorwayRealm';
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
  const url = 'http://141.11.33.30:80/realms/MotorwayRealm/protocol/openid-connect/token/introspect/';
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
app.get("/get_user", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization token missing" });
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", authHeader);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const url = `${REACT_APP_URL}/admin/realms/${Real_name}/users/`;

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.statusText}`);
      }
      const list_data = await response.json(); // Await the parsed JSON
      const updated_list_data = await Promise.all(
        list_data.map(async (element) => {
          const new_data = await getUsers_Group(element.id, authHeader); // Await the promise
          return { ...element, Group: new_data }; // Return a new object with 'Group' added
        })
      );
  
      // Send the updated list_data as JSON response
      res.status(200).json(updated_list_data);
    } catch (error) {
      console.error("Error:", error);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
async function getUsers_Group(user_uuid,token) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", token);
  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };
  try {
    const url = `${REACT_APP_URL}/admin/realms/${Real_name}/users/${user_uuid}/groups`;

    const response = await fetch(
      url,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const list_data = await response.json(); // Await the parsed JSON
    if (list_data.length === 0) {
      // If no data, return default group values
      return null;
    }
    this_gruop = list_data[0]
    grouop_array = this_gruop.path.split("/")
    res = {
      Group_id : this_gruop.id,
      Group_Name : grouop_array[1],
      Sub_Group : grouop_array[2],
    };
    return res;
  } catch (error) {
    console.error("Error:", error);
  }
}
