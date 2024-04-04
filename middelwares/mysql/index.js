import mysql from 'mysql2';

const myPool = mysql.createPool({
  host: process.env.MSHOST,
  port: process.env.MSPORT,
  user: process.env.MSUSER,
  password: process.env.MSPASSWORD,
  database: process.env.MSDATABASE
});

export default myPool;
