require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✔ SQLite connected');

    app.listen(PORT, () => {
      console.log(`✔ API running at http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/health`);
      console.log(`  API:    http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✖ Unable to start server:', error);
    process.exit(1);
  }
}

start();
