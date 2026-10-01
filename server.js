require('dotenv').config();
const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const QRCode = require('qrcode');
const { initializeDatabase, getOne, getAll, runSql } = require('./database');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'ai_securepay_secret';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}
const QR_SECRET = process.env.QR_SECRET || JWT_SECRET;
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const appRoot = __dirname;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

function createSecurePayQr(userId) {
  const payload = Buffer.from(JSON.stringify({ version: 1, userId: Number(userId) })).toString('base64url');
  const signature = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('base64url');
  return `securepay://pay?payload=${payload}&sig=${signature}`;
}

function verifySecurePayQr(value) {
  try {
    const qr = new URL(String(value || ''));
    if (qr.protocol !== 'securepay:' || qr.hostname !== 'pay') return null;
    const payload = qr.searchParams.get('payload') || '';
    const signature = qr.searchParams.get('sig') || '';
    if (!payload || !signature) return null;
    const expected = crypto.createHmac('sha256', QR_SECRET).update(payload).digest();
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.version === 1 && Number.isInteger(Number(data.userId)) ? Number(data.userId) : null;
  } catch (error) {
    return null;
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function calculateRisk(amount, metadata = {}) {
  let score = 0;
  const reasons = [];

  if (amount > 5000) {
    score += 70;
    reasons.push('Transfer exceeds the ₹5,000 step-up review threshold');
  }

  if (amount >= 25000) {
    score += 35;
    reasons.push('High transaction amount');
  } else if (amount >= 10000) {
    score += 18;
    reasons.push('Unusually large transfer');
  }

  if (metadata.isNewDevice) {
    score += 20;
    reasons.push('New device used for payment');
  }

  if (metadata.isLateNight) {
    score += 15;
    reasons.push('Payment made during unusual hours');
  }

  if (metadata.isRepeatTransfer) {
    score += 20;
    reasons.push('Multiple transfers in a short time');
  }

  if (metadata.receiverNotInContacts) {
    score += 12;
    reasons.push('Receiver is outside trusted contacts');
  }

  if (metadata.hasRiskFlags) {
    score += 18;
    reasons.push('Suspicious pattern detected');
  }

  if (metadata.nearDailyLimit) {
    score += 10;
    reasons.push('Transaction close to daily threshold');
  }

  const riskScore = Math.min(100, Math.max(0, score));
  let riskLevel = 'Low';

  if (riskScore >= 70) riskLevel = 'High';
  else if (riskScore >= 40) riskLevel = 'Medium';

  const confidence = Math.min(99, Math.max(60, riskScore + 20));

  return {
    riskScore,
    riskLevel,
    confidence: Math.round(confidence),
    reasons: reasons.length ? reasons : ['Normal spending pattern observed'],
  };
}

async function predictTransaction(payload) {
  const metadata = {
    amount: Number(payload.amount || 0),
    isNewDevice: !!payload.isNewDevice,
    isLateNight: !!payload.isLateNight,
    isRepeatTransfer: !!payload.isRepeatTransfer,
    receiverNotInContacts: !!payload.receiverNotInContacts,
    hasRiskFlags: !!payload.hasRiskFlags,
    nearDailyLimit: !!payload.nearDailyLimit,
  };

  const localRisk = calculateRisk(metadata.amount, metadata);

  try {
    const response = await fetch(`${FASTAPI_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: metadata.amount,
        receiver_name: payload.receiverName || 'Unknown Receiver',
        ...metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('FastAPI service unavailable');
    }

    const mlResult = await response.json();
    const prediction = {
      prediction: mlResult.prediction || (localRisk.riskLevel === 'High' ? 'fraud' : 'legitimate'),
      riskScore: Number(mlResult.risk_score ?? localRisk.riskScore),
      riskLevel: mlResult.risk_level || localRisk.riskLevel,
      confidence: Number(mlResult.confidence ?? localRisk.confidence),
      reasons: Array.isArray(mlResult.reasons) && mlResult.reasons.length ? mlResult.reasons : localRisk.reasons,
      modelSource: 'fastapi',
    };

    return prediction;
  } catch (error) {
    return {
      prediction: localRisk.riskLevel === 'High' ? 'fraud' : 'legitimate',
      riskScore: localRisk.riskScore,
      riskLevel: localRisk.riskLevel,
      confidence: localRisk.confidence,
      reasons: localRisk.reasons,
      modelSource: 'heuristic-fallback',
    };
  }
}

async function getUserById(id) {
  return getOne('SELECT * FROM users WHERE id = ?', [id]);
}

async function requireAdmin(req, res, next) {
  return requireAuth(req, res, async () => {
    try {
      const user = await getUserById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin privileges required.' });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Unable to verify admin access.' });
    }
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI SecurePay API is running.' });
});

app.get('/api/qr/demo.png', async (req, res) => {
  try {
    const demoUser = await getOne('SELECT id FROM users WHERE email = ?', ['demo@securepay.com']);
    if (!demoUser) return res.status(503).json({ message: 'Demo receiving account is not configured.' });
    const image = await QRCode.toBuffer(createSecurePayQr(demoUser.id), { type: 'png', width: 280, margin: 2, errorCorrectionLevel: 'H' });
    res.type('png').send(image);
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ message: 'Unable to generate the demo SecurePay QR code.' });
  }
});

app.get('/api/qr/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'user') return res.status(403).json({ message: 'A customer account is required.' });
    const qrData = createSecurePayQr(user.id);
    const image = await QRCode.toDataURL(qrData, { width: 360, margin: 2, errorCorrectionLevel: 'H' });
    return res.json({ qr: image, paymentId: `securepay-${user.id}@demo`, name: user.name, phone: user.phone });
  } catch (error) {
    console.error('Customer QR error:', error);
    return res.status(500).json({ message: 'Unable to generate your SecurePay QR code.' });
  }
});

app.post('/api/qr/verify', requireAuth, async (req, res) => {
  try {
    const recipientId = verifySecurePayQr(req.body?.qrData);
    if (!recipientId) return res.status(400).json({ message: 'This is not a valid SecurePay QR code.' });
    const recipient = await getUserById(recipientId);
    if (!recipient || recipient.role !== 'user') return res.status(404).json({ message: 'SecurePay recipient account was not found.' });
    await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [req.user.id, 'securepay_qr_verified', `Signed QR verified for customer ${recipient.id}`]);
    return res.json({
      recipient: {
        name: recipient.name,
        phone: recipient.phone,
        paymentId: `securepay-${recipient.id}@demo`,
      },
    });
  } catch (error) {
    console.error('QR verification error:', error);
    return res.status(500).json({ message: 'Unable to verify SecurePay QR code.' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'name, email, phone and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();

    const existingUser = await getOne('SELECT * FROM users WHERE email = ? OR phone = ?', [normalizedEmail, normalizedPhone]);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email or phone number.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await runSql(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, normalizedEmail, normalizedPhone, passwordHash, 'user']
    );

    const user = await getOne('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const token = signToken(user);

    await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [user.id, 'signup', 'New user account created']);

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
      message: 'Signup successful.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Unable to create user account.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body || {};

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: 'Email or phone and password are required.' });
    }

    const query = email ? 'SELECT * FROM users WHERE email = ?' : 'SELECT * FROM users WHERE phone = ?';
    const value = email ? String(email).trim().toLowerCase() : String(phone).trim();
    const user = await getOne(query, [value]);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    const token = signToken(user);

    await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [user.id, 'login', 'User logged in']);

    return res.json({
      token,
      user: sanitizeUser(user),
      message: 'Login successful.',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to login at this time.' });
  }
});

app.post('/api/auth/step-up', requireAuth, async (req, res) => {
  try {
    const amount = Number(req.body?.amount || 0);
    const receiverNumber = String(req.body?.receiverNumber || '');
    const password = String(req.body?.password || '');
    if (amount <= 5000 || !receiverNumber || !password) {
      return res.status(400).json({ message: 'A high-value transfer, recipient, and account password are required.' });
    }

    const user = await getUserById(req.user.id);
    if (!user || user.role !== 'user' || !(await bcrypt.compare(password, user.password_hash))) {
      await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [req.user.id, 'step_up_failed', 'High-value transfer re-authentication failed']);
      return res.status(401).json({ message: 'Account password was not verified. Transfer was not authorized.' });
    }

    const jti = crypto.randomUUID();
    const recipientHash = crypto.createHash('sha256').update(receiverNumber).digest('hex');
    await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [req.user.id, 'step_up_issued', jti]);
    const stepUpToken = jwt.sign(
      { id: user.id, scope: 'high-value-transfer', amount, recipientHash, jti },
      JWT_SECRET,
      { expiresIn: '5m' }
    );
    return res.json({ stepUpToken, expiresIn: 300 });
  } catch (error) {
    console.error('Step-up verification error:', error);
    return res.status(500).json({ message: 'Unable to verify this transfer.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Current user error:', error);
    return res.status(500).json({ message: 'Could not load user profile.' });
  }
});

app.post('/api/admin/unlock', async (req, res) => {
  try {
    const pin = String(req.body?.pin || '');
    const expectedPin = process.env.DEMO_ADMIN_PIN || '2024';
    if (!pin || pin !== expectedPin) {
      return res.status(401).json({ message: 'Invalid admin PIN.' });
    }

    const admin = await getOne('SELECT * FROM users WHERE email = ?', ['admin@securepay.com']);
    if (!admin || admin.role !== 'admin') {
      return res.status(503).json({ message: 'Admin account is not configured.' });
    }

    await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [admin.id, 'admin_unlock', 'Admin console unlocked']);
    return res.json({ token: signToken(admin), user: sanitizeUser(admin) });
  } catch (error) {
    console.error('Admin unlock error:', error);
    return res.status(500).json({ message: 'Unable to unlock admin console.' });
  }
});

app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    const totalTransactions = await getOne('SELECT COUNT(*) AS total FROM transactions WHERE user_id = ?', [user.id]);
    const approvedTransactions = await getOne('SELECT COUNT(*) AS total FROM transactions WHERE user_id = ? AND status = ?', [user.id, 'approved']);
    const highRiskTransactions = await getOne('SELECT COUNT(*) AS total FROM transactions WHERE user_id = ? AND risk_level = ?', [user.id, 'High']);
    const mediumRiskTransactions = await getOne('SELECT COUNT(*) AS total FROM transactions WHERE user_id = ? AND risk_level = ?', [user.id, 'Medium']);
    const recentTransactions = await getAll('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [user.id]);
    const recentNotifications = await getAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [user.id]);

    const stats = {
      totalTransactions: Number(totalTransactions?.total || 0),
      approvedTransactions: Number(approvedTransactions?.total || 0),
      highRiskTransactions: Number(highRiskTransactions?.total || 0),
      mediumRiskTransactions: Number(mediumRiskTransactions?.total || 0),
      fraudRate: Math.min(100, Number((Number(highRiskTransactions?.total || 0) / Math.max(1, Number(totalTransactions?.total || 0))) * 100).toFixed(1)),
    };

    return res.json({
      user: sanitizeUser(user),
      stats,
      recentTransactions,
      notifications: recentNotifications,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ message: 'Could not load dashboard data.' });
  }
});

app.get('/api/transactions', requireAuth, async (req, res) => {
  try {
    const transactions = await getAll(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ transactions });
  } catch (error) {
    console.error('Transactions list error:', error);
    return res.status(500).json({ message: 'Unable to fetch transaction history.' });
  }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
  try {
    const {
      amount,
      receiverName,
      receiverNumber,
      note,
      transactionType,
      authorized,
      stepUpToken,
      isNewDevice,
      isLateNight,
      isRepeatTransfer,
      receiverNotInContacts,
      hasRiskFlags,
      nearDailyLimit,
      deviceId,
      clientHour,
    } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'A valid transaction amount is required.' });
    }

    if (String(authorized) !== 'true') {
      return res.status(403).json({ message: 'User authorization is required before saving this transaction.' });
    }

    let stepUpClaims = null;
    let issuedStepUp = null;
    if (Number(amount) > 5000) {
      try {
        stepUpClaims = jwt.verify(String(stepUpToken || ''), JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ message: 'High-value transfer requires account password verification.' });
      }
      const recipientHash = crypto.createHash('sha256').update(String(receiverNumber || '')).digest('hex');
      if (stepUpClaims.id !== req.user.id || stepUpClaims.scope !== 'high-value-transfer' || Number(stepUpClaims.amount) !== Number(amount) || stepUpClaims.recipientHash !== recipientHash) {
        return res.status(403).json({ message: 'Verification does not match this amount and recipient.' });
      }
      issuedStepUp = await getOne('SELECT id FROM audit_logs WHERE user_id = ? AND action = ? AND details = ?', [req.user.id, 'step_up_issued', stepUpClaims.jti]);
      if (!issuedStepUp) return res.status(409).json({ message: 'This verification was already used or expired.' });
    }

    const recentTransactions = await getAll(
      'SELECT receiver_number, amount, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [req.user.id]
    );
    const now = Date.now();
    const recentPayeeTransfer = recentTransactions.some((transaction) =>
      transaction.receiver_number === (receiverNumber || '') &&
      now - new Date(transaction.created_at).getTime() < 10 * 60 * 1000
    );
    const today = new Date().toISOString().slice(0, 10);
    const todayTotal = recentTransactions
      .filter((transaction) => String(transaction.created_at).startsWith(today))
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
    const validDeviceId = typeof deviceId === 'string' && /^[a-zA-Z0-9-]{20,64}$/.test(deviceId);
    const deviceHash = validDeviceId ? crypto.createHash('sha256').update(deviceId).digest('hex') : '';
    const seenDevice = deviceHash ? await getOne(
      'SELECT id FROM audit_logs WHERE user_id = ? AND action = ? AND details = ?',
      [req.user.id, 'device_seen', deviceHash]
    ) : true;
    if (deviceHash && !seenDevice) {
      await runSql('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)', [req.user.id, 'device_seen', deviceHash]);
    }
    const hour = Number(clientHour);
    const risk = await predictTransaction({
      amount,
      receiverName,
      isNewDevice: Boolean(deviceHash && !seenDevice) || Boolean(isNewDevice),
      isLateNight: Number.isInteger(hour) ? hour >= 23 || hour < 5 : Boolean(isLateNight),
      isRepeatTransfer: recentPayeeTransfer || Boolean(isRepeatTransfer),
      receiverNotInContacts: !recentTransactions.some((transaction) => transaction.receiver_number === (receiverNumber || '')) || Boolean(receiverNotInContacts),
      hasRiskFlags,
      nearDailyLimit: todayTotal + Number(amount) >= 25000 || Boolean(nearDailyLimit),
    });

    if (stepUpClaims) {
      const consumed = await runSql('UPDATE audit_logs SET action = ? WHERE id = ? AND action = ?', ['step_up_used', issuedStepUp.id, 'step_up_issued']);
      const changes = consumed.changes ?? consumed[0]?.affectedRows;
      if (changes !== 1) return res.status(409).json({ message: 'This verification was already used.' });
    }

    const record = await runSql(
      `INSERT INTO transactions
        (user_id, receiver_name, receiver_number, amount, transaction_type, note, status, risk_level, risk_score, confidence, reasons, authorized)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        receiverName || 'Unknown Receiver',
        receiverNumber || '',
        Number(amount),
        transactionType || 'transfer',
        note || '',
        risk.riskLevel === 'High' ? 'pending_review' : 'approved',
        risk.riskLevel,
        risk.riskScore,
        risk.confidence,
        JSON.stringify(risk.reasons),
        1,
      ]
    );

    const storedTransaction = await getOne('SELECT * FROM transactions WHERE id = ?', [record.insertId]);

    await runSql(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [
        req.user.id,
        risk.riskLevel === 'High' ? 'High risk transaction detected' : 'Transaction approved',
        risk.riskLevel === 'High'
          ? `AI flagged this transfer as ${risk.riskLevel.toLowerCase()} risk. Please review the transaction.`
          : `Your transaction of ₹${Number(amount).toLocaleString('en-IN')} has been saved securely.`,
        risk.riskLevel === 'High' ? 'warning' : 'success',
      ]
    );

    await runSql(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'transaction_created', `Transaction ${storedTransaction.id} created with risk ${risk.riskLevel}`]
    );

    return res.status(201).json({
      message: 'Transaction saved successfully.',
      transaction: storedTransaction,
      risk,
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    return res.status(500).json({ message: 'Unable to store the transaction.' });
  }
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  try {
    const notifications = await getAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ notifications });
  } catch (error) {
    console.error('Notifications error:', error);
    return res.status(500).json({ message: 'Could not fetch notifications.' });
  }
});

app.get('/api/admin/summary', requireAdmin, async (req, res) => {
  try {
    const totals = await getOne('SELECT COUNT(*) AS total, COUNT(DISTINCT CASE WHEN risk_level = "High" THEN user_id END) AS high_risk_users, SUM(CASE WHEN risk_level = "High" THEN 1 ELSE 0 END) AS high_risk, SUM(CASE WHEN risk_level = "Medium" THEN 1 ELSE 0 END) AS medium_risk, SUM(CASE WHEN risk_level = "Low" THEN 1 ELSE 0 END) AS low_risk FROM transactions');
    const daily = await getAll('SELECT DATE(created_at) AS day, COUNT(*) AS total, SUM(CASE WHEN risk_level = "High" THEN 1 ELSE 0 END) AS high_risk FROM transactions GROUP BY DATE(created_at) ORDER BY day DESC LIMIT 7');

    return res.json({
      totals: {
        total: Number(totals?.total || 0),
        highRisk: Number(totals?.high_risk || 0),
        mediumRisk: Number(totals?.medium_risk || 0),
        lowRisk: Number(totals?.low_risk || 0),
        highRiskUsers: Number(totals?.high_risk_users || 0),
      },
      daily: daily.reverse(),
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    return res.status(500).json({ message: 'Could not fetch admin data.' });
  }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await getAll('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    return res.json({ users: users.map((entry) => sanitizeUser(entry)) });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ message: 'Could not fetch users.' });
  }
});

app.get('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const user = await getOne('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'Customer not found.' });
    const transactions = await getAll(
      'SELECT id, receiver_name, receiver_number, amount, transaction_type, status, risk_level, risk_score, reasons, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [user.id]
    );
    const totals = await getOne('SELECT COUNT(*) AS count, SUM(amount) AS amount, SUM(CASE WHEN risk_level = "High" THEN 1 ELSE 0 END) AS high_risk FROM transactions WHERE user_id = ?', [user.id]);
    return res.json({
      user,
      totals: { count: Number(totals?.count || 0), amount: Number(totals?.amount || 0), highRisk: Number(totals?.high_risk || 0) },
      transactions,
    });
  } catch (error) {
    console.error('Admin customer detail error:', error);
    return res.status(500).json({ message: 'Could not load customer details.' });
  }
});

app.get('/api/admin/transactions', requireAdmin, async (req, res) => {
  try {
    const transactions = await getAll(`
      SELECT t.id, u.name AS customer_name, u.email, t.receiver_name, t.receiver_number,
             t.amount, t.transaction_type, t.status, t.risk_level, t.risk_score, t.created_at
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC
      LIMIT 100
    `);
    return res.json({ transactions });
  } catch (error) {
    console.error('Admin transactions error:', error);
    return res.status(500).json({ message: 'Could not fetch transactions.' });
  }
});

app.get('/api/admin/transactions/:id', requireAdmin, async (req, res) => {
  try {
    const transaction = await getOne(`
      SELECT t.*, u.name AS customer_name, u.email, u.phone
      FROM transactions t JOIN users u ON u.id = t.user_id WHERE t.id = ?
    `, [req.params.id]);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    let reasons = [];
    try { reasons = JSON.parse(transaction.reasons || '[]'); } catch (error) { reasons = ['Risk details are unavailable.']; }
    return res.json({ transaction: { ...transaction, reasons } });
  } catch (error) {
    console.error('Admin transaction detail error:', error);
    return res.status(500).json({ message: 'Could not load transaction details.' });
  }
});

app.get('/api/admin/activity', requireAdmin, async (req, res) => {
  try {
    const activity = await getAll(`
      SELECT a.id, a.action, a.details, a.created_at, u.name, u.email
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT 50
    `);

    return res.json({ activity });
  } catch (error) {
    console.error('Admin activity error:', error);
    return res.status(500).json({ message: 'Could not fetch activity logs.' });
  }
});

app.get('/api/banks', async (req, res) => {
  try {
    const banks = await getAll('SELECT * FROM banks ORDER BY name ASC');
    return res.json({ banks });
  } catch (error) {
    console.error('Bank list error:', error);
    return res.status(500).json({ message: 'Unable to fetch banks.' });
  }
});

app.get('/api/banks/:id', async (req, res) => {
  try {
    const bank = await getOne('SELECT * FROM banks WHERE id = ?', [req.params.id]);
    if (!bank) {
      return res.status(404).json({ message: 'Bank not found.' });
    }

    const opportunities = await getAll('SELECT * FROM opportunities WHERE bank_id = ? ORDER BY created_at DESC', [req.params.id]);
    return res.json({ bank, opportunities });
  } catch (error) {
    console.error('Bank detail error:', error);
    return res.status(500).json({ message: 'Unable to fetch bank details.' });
  }
});

app.get('/api/opportunities', async (req, res) => {
  try {
    const opportunities = await getAll(`
      SELECT o.*, b.name AS bank_name, b.logo_url AS bank_logo, b.bank_type
      FROM opportunities o
      LEFT JOIN banks b ON b.id = o.bank_id
      WHERE o.status = 'published'
      ORDER BY o.created_at DESC
    `);
    return res.json({ opportunities });
  } catch (error) {
    console.error('Opportunity list error:', error);
    return res.status(500).json({ message: 'Unable to fetch opportunities.' });
  }
});

app.get('/api/opportunities/:id', async (req, res) => {
  try {
    const opportunity = await getOne(`
      SELECT o.*, b.name AS bank_name, b.logo_url AS bank_logo, b.bank_type, b.website, b.headquarters
      FROM opportunities o
      LEFT JOIN banks b ON b.id = o.bank_id
      WHERE o.id = ?
    `, [req.params.id]);

    if (!opportunity) {
      return res.status(404).json({ message: 'Opportunity not found.' });
    }

    return res.json({ opportunity });
  } catch (error) {
    console.error('Opportunity detail error:', error);
    return res.status(500).json({ message: 'Unable to fetch opportunity details.' });
  }
});

app.get('/api/ml/predict', async (req, res) => {
  try {
    const payload = {
      amount: Number(req.query.amount || 0),
      receiverName: req.query.receiverName || 'Unknown Receiver',
      isNewDevice: req.query.isNewDevice === 'true',
      isLateNight: req.query.isLateNight === 'true',
      isRepeatTransfer: req.query.isRepeatTransfer === 'true',
      receiverNotInContacts: req.query.receiverNotInContacts === 'true',
      hasRiskFlags: req.query.hasRiskFlags === 'true',
      nearDailyLimit: req.query.nearDailyLimit === 'true',
    };

    const result = await predictTransaction(payload);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to predict transaction risk.' });
  }
});

app.post('/api/ml/predict', async (req, res) => {
  try {
    const result = await predictTransaction(req.body || {});
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to predict transaction risk.' });
  }
});

app.get('/', (req, res) => res.sendFile(path.join(appRoot, 'index.html')));
app.get('/:page.html', (req, res, next) => {
  const page = `${path.basename(req.params.page)}.html`;
  res.sendFile(path.join(appRoot, page), (error) => {
    if (error) next();
  });
});
app.use('/css', express.static(path.join(appRoot, 'css')));
app.use('/js', express.static(path.join(appRoot, 'js')));
app.use('/images', express.static(path.join(appRoot, 'images')));
app.use('/vendor/html5-qrcode', express.static(path.join(appRoot, 'node_modules', 'html5-qrcode')));
app.use((req, res) => res.status(404).json({ message: 'Resource not found.' }));

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`AI SecurePay server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();
