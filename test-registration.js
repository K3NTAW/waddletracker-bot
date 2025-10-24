const axios = require('axios');

// Test the registration API directly
async function testRegistration() {
  const apiBaseUrl = 'https://waddletracker-backend.vercel.app/api';
  
  const testData = {
    discord_id: '985329450696716348',
    username: 'k3ntaw',
    avatar_url: 'https://cdn.discordapp.com/avatars/985329450696716348/avatar.png'
  };

  console.log('Testing registration with data:', testData);
  console.log('API URL:', `${apiBaseUrl}/discord/register`);

  try {
    const response = await axios.post(`${apiBaseUrl}/discord/register`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);

  } catch (error) {
    console.log('❌ ERROR!');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', error.response?.data);
    console.log('Error Message:', error.message);
  }
}

testRegistration();
