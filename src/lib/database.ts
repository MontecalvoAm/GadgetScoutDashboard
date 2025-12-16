import mysql from 'mysql2/promise';

export const dbConfig = {
  host: '127.0.0.1',
  port: 6603,
  user: 'root',
  password: '12345',
  database: 'dashboard',
};

export async function getConnection() {
  return await mysql.createConnection(dbConfig);
}

export async function testConnection() {
  try {
    const conn = await getConnection();
    await conn.query('SELECT 1');
    console.log('✅ Database connected successfully');
    await conn.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}
