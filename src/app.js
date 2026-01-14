require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDB = require('./db/db-init');

const app = express();

// Middleware first
app.use(cors());
app.use(express.json());

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'healthserv running' });
});

// Routes
app.use('/doctor', require('./routes/doctor.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('/patient', require('./routes/patient.routes'));
app.use('/api/health', require('./routes/bmi.routes'));

// Start server after DB is ready
initDB()
  .then(() => {
    console.log('DB Initialized: tables ready');
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => {
    console.error('Failed to init DB', err);
    process.exit(1);
  });

module.exports = app;
