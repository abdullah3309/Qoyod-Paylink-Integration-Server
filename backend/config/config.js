
module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};