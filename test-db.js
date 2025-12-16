const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 6603,          // Back to 6603 (This worked earlier!)
      user: 'root',        // Using root as seen in your screenshot
      password: '12345'    // Your root password
    });

    console.log('✅ Connected to Server!');
    
    // Check if the database exists
    const [rows] = await conn.query('SHOW DATABASES LIKE "dashboard"');
    if (rows.length > 0) {
        console.log('✅ Database "dashboard" found!');
        // Now try to select it
        await conn.changeUser({ database: 'dashboard' });
        const [tableCounts] = await conn.query('SELECT COUNT(*) as count FROM M_Users');
        console.log('✅ Users table has:', tableCounts[0].count, 'records');
    } else {
        console.error('❌ Database "dashboard" does NOT exist on this Linux server.');
        console.log('   (You might have created it in Windows, but not inside WSL)');
        console.log('   Run this command to create it now:\n');
        console.log('   CREATE DATABASE dashboard;');
    }
    
    await conn.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDB();
