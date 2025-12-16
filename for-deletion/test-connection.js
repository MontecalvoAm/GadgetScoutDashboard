// Quick test to verify MySQL connection with provided credentials
const mysql = require('mysql2/promise');

const testConnection = async () => {
  const config = {
    host: '127.0.0.1',
    port: 6603,
    user: 'root',
    password: '12345',
    database: 'dashboard'
  };

  try {
    console.log('Testing database connection...');
    const connection = await mysql.createConnection(config);

    console.log('✅ Connected to MySQL successfully!');

    // Test user query
    const [users] = await connection.execute('SELECT * FROM M_Users');
    console.log('✅ Users found:', users.length);

    // Test roles
    const [roles] = await connection.execute('SELECT * FROM M_Roles');
    console.log('✅ Roles found:', roles.length);

    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

testConnection();