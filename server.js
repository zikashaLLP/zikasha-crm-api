const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const sequelize = require('./config/database');
const Agency = require('./models/Agency');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const logRoutes = require('./routes/logRoutes');
const agency_routes = require('./routes/agencyRoutes');


require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(fileUpload());

// Add this after app.use(express.json())
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/agencies', agency_routes);

// Sync and connect
sequelize.sync({ alter: true })
  .then(() => {
    console.log('DB connected and models synced');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error('Unable to connect to DB:', err));
