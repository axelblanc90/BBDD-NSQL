require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const superheroRoutes = require('./routes/superheroRoutes');
const seedDatabase = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/superheroes';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/superheroes', superheroRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Run the seeder function to ensure we have initial data
    await seedDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
