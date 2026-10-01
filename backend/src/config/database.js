import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  port: process.env.DB_PORT || 3306,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
