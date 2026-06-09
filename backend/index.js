const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// Mock routes for future authentication (login/registration)
app.post('/api/auth/register', (req, res) => {
  // TODO: Implement actual registration logic later
  // For now, in development mode, we just return a success message
  res.json({ message: 'Registration placeholder endpoint hit successfully' });
});

app.post('/api/auth/login', (req, res) => {
  // TODO: Implement actual login logic later
  // For now, in development mode, we just return a fake token and success
  res.json({ 
    message: 'Login placeholder endpoint hit successfully',
    token: 'fake-jwt-token-for-development'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
