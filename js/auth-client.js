window.AISecurePayAPI = (() => {
  const TOKEN_KEY = 'securepayToken';
  const USER_KEY = 'securepayUser';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function saveAuth(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function request(endpoint, options = {}) {
    const token = getToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof payload === 'string' ? payload : payload.message || 'Request failed';
      throw new Error(message);
    }

    return payload;
  }

  async function loadDashboard() {
    try {
      const token = getToken();
      if (!token) {
        window.location.href = 'mobile-verification.html';
        return;
      }

      const result = await request('/api/dashboard');
      const user = result.user || JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      const [transactionResult, notificationResult] = await Promise.all([
        request('/api/transactions'),
        request('/api/notifications'),
      ]);
      const transactions = transactionResult.transactions || [];
      const history = transactions.map((transaction) => ({
        id: transaction.id,
        receiver_name: transaction.receiver_name,
        receiver_number: transaction.receiver_number,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        note: transaction.note,
        created_at: transaction.created_at,
        date: new Date(transaction.created_at).toLocaleString('en-IN'),
        status: transaction.risk_level === 'High' ? 'Suspicious' : 'Success',
        riskLevel: transaction.risk_level,
        riskScore: transaction.risk_score,
        riskReasons: (() => {
          try { return JSON.parse(transaction.reasons || '[]'); } catch (error) { return []; }
        })(),
        type: 'Debit',
      }));
      localStorage.setItem('transactionHistory', JSON.stringify(history));
      localStorage.setItem('fraudAlerts', JSON.stringify(transactions
        .filter((transaction) => transaction.risk_level === 'High')
        .map((transaction) => ({
          id: `transaction-${transaction.id}`,
          title: 'High-risk transfer review',
          name: transaction.receiver_name,
          amount: `₹${Number(transaction.amount).toLocaleString('en-IN')}`,
          level: transaction.risk_level,
          reason: transaction.reasons || 'Risk threshold exceeded',
          status: 'Pending',
          date: new Date(transaction.created_at).toLocaleDateString(),
          time: new Date(transaction.created_at).toLocaleTimeString(),
        }))));
      localStorage.setItem('notifications', JSON.stringify((notificationResult.notifications || []).map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        category: notification.type === 'warning' ? 'security' : 'payment',
        icon: notification.type === 'warning' ? 'fa-shield-halved' : 'fa-money-bill-transfer',
        type: notification.type === 'warning' ? 'danger' : 'success',
        read: false,
        date: new Date(notification.created_at).toLocaleDateString(),
        time: new Date(notification.created_at).toLocaleTimeString(),
      }))));
      const headerName = document.getElementById('headerUserName');
      const headerPhone = document.getElementById('headerUserPhone');
      const headerInitial = document.getElementById('headerUserInitial');
      if (headerName) headerName.textContent = user.name || 'SecurePay customer';
      if (headerPhone) headerPhone.textContent = user.phone || user.email || 'Account profile';
      if (headerInitial) headerInitial.textContent = (user.name || 'S').trim().charAt(0).toUpperCase();
      const nameElement = document.querySelector('.welcome-section h1');
      if (nameElement) {
        const displayName = user.name || 'User';
        nameElement.textContent = `${displayName.split(' ')[0]} 👋`;
      }

      const riskBadge = document.querySelector('.risk-badge');
      if (riskBadge) {
        const totalRisk = (result.stats?.highRiskTransactions || 0) + (result.stats?.mediumRiskTransactions || 0);
        riskBadge.textContent = totalRisk > 0 ? 'Review Needed' : 'Low Risk';
        riskBadge.classList.toggle('warning', totalRisk > 0);
      }

      const notificationBadge = document.querySelector('.notification span');
      if (notificationBadge && result.notifications) {
        notificationBadge.textContent = result.notifications.length;
      }

      const savedProfile = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      if (savedProfile && savedProfile.email) {
        localStorage.setItem(USER_KEY, JSON.stringify({ ...savedProfile, ...user }));
      }

      return result;
    } catch (error) {
      console.error('dashboard load error:', error);
      clearAuth();
      window.location.href = 'mobile-verification.html';
    }
  }

  return {
    getToken,
    saveAuth,
    clearAuth,
    request,
    loadDashboard,
  };
})();
