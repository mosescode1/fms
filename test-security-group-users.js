const axios = require('axios');

// Configuration
const baseUrl = 'http://localhost:3000/api/v1'; // Adjust if your server runs on a different port
const securityGroupId = 'your-security-group-id'; // Replace with an actual security group ID
const token = 'your-auth-token'; // Replace with an actual authentication token

// Test function to get users in a security group
async function testGetUsersInGroup() {
  try {
    const response = await axios.get(
      `${baseUrl}/security-group/${securityGroupId}/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing getUsersInGroup:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
}

// Run the test
testGetUsersInGroup()
  .then(() => console.log('Test completed successfully'))
  .catch(() => console.log('Test failed'));