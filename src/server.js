const { app } = require('./app');
const initDB = require('./db/db-init');
const { logger } = require('@emedihub/observability-backend');
const PORT = process.env.PORT || 4004;

initDB()
  .then(() => {
    logger.info('DB Initialized: tables ready');
    app.listen(PORT, () => {
      logger.info(`healthserv running on port ${PORT}`);
    });
  })
  .catch(err => {
    logger.error('Failed to init DB', err);
    process.exit(1);
  });
