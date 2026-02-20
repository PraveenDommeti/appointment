import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';

dotenv.config();

console.log("🚀 SERVER STARTING...");
console.log("Checking DB Config...");
console.log("HOST:", process.env.MYSQLHOST || process.env.DB_HOST);
console.log("PORT:", process.env.MYSQLPORT || process.env.DB_PORT);

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    ssl: {
        rejectUnauthorized: false
    }
});

const query = async (sql, params = []) => {
    try {
        const [results] = await pool.query(sql, params);
        return results;
    } catch (err) {
        console.error('❌ DB Query Error:', sql);
        console.error('Detailed Error:', err);
        throw err;
    }
};

// Test connection on start
(async () => {
    try {
        await query('SELECT 1');
        console.log('✅ MySQL Connected Successfully');
    } catch (e) {
        console.error('❌ MySQL Connection Failed:', e.message);
    }
})();

// Root Route
app.get('/', (req, res) => {
    res.send("Server is running. Routes are temporarily disabled for debugging.");
});

/*
// ALL OTHER ROUTES DISABLED

app.post('/api/login', ...)
app.get('/api/users', ...)
...
*/

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 API Server ready on http://localhost:${PORT}`);
});
