// --------------------------------- db store -------------------------------------
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('mysql');

dotenv.config({
  path: path.resolve(
    process.cwd(),'.env'
  )
});

const conn = mysql.createConnection({
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME,
  host     : process.env.DB_HOST,
  port: 3306,
});
conn.connect();

module.exports = conn
// ---------------------------------------------------------------------------------