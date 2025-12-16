import mysql from 'mysql2/promise';

// Fixed database configuration for port 6603
const dbConfig = {
  host: '127.0.0.1',
  port: 6603,
  user: 'root',
  password: '12345',
  database: 'dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool for better performance
let pool: mysql.Pool | null = null;

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (error) {
      console.error('Failed to create database pool:', error);
      throw error;
    }
  }
  return pool.getConnection();
}

export async function executeQuery(query: string, params?: any[]) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(query, params);
    return results;
  } finally {
    connection.release();
  }
}

export async function testConnection() {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}