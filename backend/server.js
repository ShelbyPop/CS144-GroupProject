require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.js');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
   app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${process.env.PORT}`);
}).on('error', (err) => {
  console.error('Listen error:', err);
});
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });

console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');