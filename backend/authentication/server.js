const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Allow requests from frontend
app.use(cors({
  origin: 'https://www.gocarbonpositive.com', // your React app URL
  credentials: true, // if you use cookies
}));

app.use(express.json());

// Your routes
app.use('/api/auth', require('./routes/authRoutes'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
