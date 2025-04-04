import "dotenv/config";

const isProduction = process.env.NODE_ENV === "production";

export default {
  client: "mysql2",
  connection: {
    host: isProduction ? process.env.MYSQLHOST : process.env.DB_HOST,
    port: isProduction ? process.env.MYSQLPORT : process.env.DB_PORT,
    database: isProduction ? process.env.MYSQLDATABASE : process.env.DB_NAME,
    user: isProduction ? process.env.MYSQLUSER : process.env.DB_USER,
    password: isProduction
      ? process.env.MYSQLPASSWORD
      : process.env.DB_PASSWORD,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./migrations",
  },
};
