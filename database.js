const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');

const appRoot = __dirname;
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();
const dbFile = path.resolve(process.env.DB_FILE || path.join(appRoot, 'securepay.sqlite'));

let connection = null;
let dbMode = 'sqlite';

async function createSqliteDb() {
  await fs.promises.mkdir(path.dirname(dbFile), { recursive: true });

  if (fs.existsSync(dbFile)) {
    return;
  }

  await new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbFile, (err) => {
      if (err) return reject(err);
      db.close(() => resolve());
    });
  });
}

async function initializeDatabase() {
  if (dbType === 'mysql' && process.env.MYSQL_HOST) {
    dbMode = 'mysql';
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'ai_securepay',
      multipleStatements: true,
    });

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        receiver_name VARCHAR(150) DEFAULT 'Unknown Receiver',
        receiver_number VARCHAR(50) DEFAULT '',
        amount DECIMAL(10,2) NOT NULL,
        transaction_type VARCHAR(50) DEFAULT 'transfer',
        note VARCHAR(255) DEFAULT '',
        status VARCHAR(40) DEFAULT 'approved',
        risk_level VARCHAR(20) DEFAULT 'Low',
        risk_score INT DEFAULT 0,
        confidence INT DEFAULT 0,
        reasons TEXT,
        authorized TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(150) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
  } else {
    dbMode = 'sqlite';
    await createSqliteDb();
    connection = new sqlite3.Database(dbFile);

    await runSql(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        receiver_name TEXT DEFAULT 'Unknown Receiver',
        receiver_number TEXT DEFAULT '',
        amount REAL NOT NULL,
        transaction_type TEXT DEFAULT 'transfer',
        note TEXT DEFAULT '',
        status TEXT DEFAULT 'approved',
        risk_level TEXT DEFAULT 'Low',
        risk_score INTEGER DEFAULT 0,
        confidence INTEGER DEFAULT 0,
        reasons TEXT,
        authorized INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo_url TEXT,
        bank_type TEXT,
        description TEXT,
        headquarters TEXT,
        website TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bank_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        qualification TEXT,
        experience TEXT,
        location TEXT,
        salary TEXT,
        deadline TEXT,
        skills TEXT,
        application_url TEXT,
        status TEXT DEFAULT 'published',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bank_id) REFERENCES banks(id)
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS saved_banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        bank_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (bank_id) REFERENCES banks(id)
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS saved_opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        opportunity_id INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
      )
    `);

    await runSql(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        opportunity_id INTEGER NOT NULL,
        status TEXT DEFAULT 'Saved',
        applied_date TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
      )
    `);
  }

  await seedDefaultUsers();
}

async function seedDefaultUsers() {
  const defaultUserPassword = await bcrypt.hash('SecurePay@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  if (dbMode === 'mysql') {
    const [existingUsers] = await connection.query('SELECT email FROM users WHERE email IN (?, ?)', ['demo@securepay.com', 'admin@securepay.com']);
    const existingEmails = new Set(existingUsers.map((user) => user.email));

    if (!existingEmails.has('demo@securepay.com')) {
      await connection.execute(
        'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['Demo User', 'demo@securepay.com', '+919876543210', defaultUserPassword, 'user']
      );
    }

    if (!existingEmails.has('admin@securepay.com')) {
      await connection.execute(
        'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        ['System Admin', 'admin@securepay.com', '+919999999999', adminPassword, 'admin']
      );
    }
  } else {
    await runSql(
      `INSERT OR IGNORE INTO users (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?);`,
      ['Demo User', 'demo@securepay.com', '+919876543210', defaultUserPassword, 'user']
    );

    await runSql(
      `INSERT OR IGNORE INTO users (name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?);`,
      ['System Admin', 'admin@securepay.com', '+919999999999', adminPassword, 'admin']
    );
  }

  await seedBankData();
  await seedOpportunityData();
}

async function seedBankData() {
  const bankCount = await getOne('SELECT COUNT(*) AS total FROM banks');
  if (Number(bankCount?.total || 0) > 0) {
    return;
  }

  const banks = [
    ['State Bank of India', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/1200px-SBI-logo.svg.png', 'Public Sector', 'Largest public sector bank with strong nationwide reach and modern digital banking solutions.', 'Mumbai, Maharashtra', 'https://sbi.co.in', 'active'],
    ['HDFC Bank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/HDFC_Bank_Logo.svg/2560px-HDFC_Bank_Logo.svg.png', 'Private Sector', 'Digital-first private banking institution focused on retail, corporate, and business banking.', 'Mumbai, Maharashtra', 'https://www.hdfcbank.com', 'active'],
    ['ICICI Bank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ICICI_Bank_Logo.svg/2560px-ICICI_Bank_Logo.svg.png', 'Private Sector', 'Technology-driven private bank offering retail, SME, and digital financial products.', 'Mumbai, Maharashtra', 'https://www.icicibank.com', 'active'],
    ['Axis Bank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Axis_Bank_Logo.svg/2560px-Axis_Bank_Logo.svg.png', 'Private Sector', 'Retail and corporate banking specialist with strong digital infrastructure and service network.', 'Mumbai, Maharashtra', 'https://www.axisbank.com', 'active'],
    ['Kotak Mahindra Bank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Kotak_Mahindra_Bank_logo.svg/2560px-Kotak_Mahindra_Bank_logo.svg.png', 'Private Sector', 'Customer-centric bank with strong personal banking, wealth, and corporate services.', 'Mumbai, Maharashtra', 'https://www.kotak.com', 'active'],
    ['Punjab National Bank', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/PNB_logo.svg/2560px-PNB_logo.svg.png', 'Public Sector', 'Legacy public bank with widespread branch coverage and customer-focused financial services.', 'New Delhi, Delhi', 'https://www.pnbindia.in', 'active']
  ];

  for (const bank of banks) {
    await runSql(
      `INSERT INTO banks (name, logo_url, bank_type, description, headquarters, website, status)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      bank
    );
  }
}

async function seedOpportunityData() {
  const oppCount = await getOne('SELECT COUNT(*) AS total FROM opportunities');
  if (Number(oppCount?.total || 0) > 0) {
    return;
  }

  const opportunityRows = [
    [1, 'Relationship Manager', 'Support retail and SME customer growth with digital banking advisory services.', 'Graduate in any discipline', '1-3 years', 'Bengaluru', '₹6-10 LPA', '2026-10-15', 'Customer management, sales, banking operations', 'https://sbi.co.in', 'published'],
    [2, 'Risk Analyst', 'Analyze financial data and monitor credit and transaction risk parameters across digital products.', 'B.Com / BBA / MBA preferred', '2-4 years', 'Hyderabad', '₹8-14 LPA', '2026-10-20', 'Risk modeling, Excel, SQL, data analysis', 'https://www.hdfcbank.com', 'published'],
    [3, 'Banking Operations Executive', 'Support daily branch and digital operations with high service quality and process efficiency.', 'Graduate with good communication skills', '0-2 years', 'Pune', '₹5-8 LPA', '2026-10-25', 'Operations, customer support, process management', 'https://www.icicibank.com', 'published'],
    [4, 'Business Analyst - Digital Banking', 'Drive digital transformation initiatives and improve user journeys across banking products.', 'B.Tech / MBA / B.E.', '2-5 years', 'Mumbai', '₹10-18 LPA', '2026-10-18', 'User research, analytics, digital banking, SQL', 'https://www.axisbank.com', 'published'],
    [5, 'Credit Analyst', 'Assess lending opportunities and evaluate customer financial profiles to support credit decisions.', 'Finance / Economics / MBA', '1-3 years', 'Chennai', '₹7-12 LPA', '2026-10-30', 'Credit assessment, financial analysis, Excel', 'https://www.kotak.com', 'published'],
    [6, 'Branch Banking Officer', 'Manage customer transactions, banking services, and branch productivity with quality service focus.', 'Graduate in any discipline', '1-2 years', 'Delhi', '₹5-9 LPA', '2026-10-12', 'Customer handling, branch operations, sales', 'https://www.pnbindia.in', 'published']
  ];

  for (const row of opportunityRows) {
    await runSql(
      `INSERT INTO opportunities (bank_id, title, description, qualification, experience, location, salary, deadline, skills, application_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      row
    );
  }
}

function runSql(sql, params = []) {
  if (dbMode === 'mysql') {
    return connection.execute(sql, params);
  }

  return new Promise((resolve, reject) => {
    connection.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ insertId: this.lastID, changes: this.changes });
    });
  });
}

function getOne(sql, params = []) {
  if (dbMode === 'mysql') {
    return connection.query(sql, params).then(([rows]) => rows[0] || null);
  }

  return new Promise((resolve, reject) => {
    connection.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function getAll(sql, params = []) {
  if (dbMode === 'mysql') {
    return connection.query(sql, params).then(([rows]) => rows);
  }

  return new Promise((resolve, reject) => {
    connection.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

module.exports = {
  initializeDatabase,
  getOne,
  getAll,
  runSql,
  dbMode,
  getConnection: () => connection,
};
