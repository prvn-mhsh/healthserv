require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();


const swaggerDocument = require('../swagger.json');

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware
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

// Export app and DB init
module.exports = { app};
