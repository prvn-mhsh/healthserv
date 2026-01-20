const { app } = require('./app');
const initDB = require('./db/db-init');
const PORT = process.env.PORT || 4004;

initDB()
  .then(() => {
    console.log('DB Initialized: tables ready');
    app.listen(PORT, () => {
      console.log(`healthserv running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to init DB', err);
    process.exit(1);
  });
