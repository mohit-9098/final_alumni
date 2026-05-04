const axios = require('axios');
require('dotenv').config();

const testAdminLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin-login', {
      email: 'admin@mohit.com',
      password: 'admin123'
    });

    console.log('Status:', response.status);
    console.log('Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error Response:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
};

testAdminLogin();
