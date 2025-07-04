const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const Agency = require('./models/Agency');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const logRoutes = require('./routes/logRoutes');


require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

// Add this after app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/logs', logRoutes);

// Sync and connect
sequelize.sync({ alter: process.env.ENVIRONMENT === 'development' }) // For dev only. Use migrations in prod.
  .then(() => {
    console.log('DB connected and models synced');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('Unable to connect to DB:', err));
