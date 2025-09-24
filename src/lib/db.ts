import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '151.106.119.252',
  port: 3306,
  user: 'cbnb9676_cbnbandung_user',
  password: 'Arkan@199003',
  database: 'cbnb9676_cafe_pos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00' // Asia/Jakarta timezone
});

export const query = async (sql: string, params?: any[]) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

export default pool;
