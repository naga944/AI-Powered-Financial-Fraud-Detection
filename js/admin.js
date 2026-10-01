document.addEventListener('DOMContentLoaded', async () => {
  const pinForm = document.getElementById('pinForm');
  const pinInput = document.getElementById('adminPin');
  const pinError = document.getElementById('pinError');
  const pinOverlay = document.getElementById('pinOverlay');
  const adminDashboardContent = document.getElementById('adminDashboardContent');

  const totalUsersEl = document.getElementById('totalUsers');
  const totalTransactionsEl = document.getElementById('totalTransactions');
  const fraudCasesEl = document.getElementById('fraudCases');
  const highRiskUsersEl = document.getElementById('highRiskUsers');
  const activityTableBody = document.getElementById('activityTableBody');
  const customerTableBody = document.getElementById('customerTableBody');
  const transactionTableBody = document.getElementById('transactionTableBody');
  const detailDialog = document.getElementById('adminDetailDialog');
  const detailTitle = document.getElementById('adminDetailTitle');
  const detailBody = document.getElementById('adminDetailBody');
  const bankListEl = document.getElementById('bankList');
  const bankDetailEl = document.getElementById('bankDetail');

  let banksCache = [];
  let opportunitiesCache = [];
  let selectedBankId = null;

  Chart.defaults.color = '#dfeeff';
  Chart.defaults.font.family = 'Poppins, sans-serif';
  Chart.defaults.font.size = 12;

  function formatDate(dateValue) {
    if (!dateValue) return '—';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  function bankLogo(name) {
    const normalized = String(name || '').toLowerCase();
    if (normalized.includes('state bank') || normalized === 'sbi') return 'SBI';
    if (normalized.includes('hdfc')) return 'HDFC';
    if (normalized.includes('icici')) return 'ICICI';
    if (normalized.includes('axis')) return 'AXIS';
    if (normalized.includes('kotak')) return 'K';
    if (normalized.includes('punjab national') || normalized.includes('pnb')) return 'PNB';
    return (name || 'B').slice(0, 3).toUpperCase();
  }

  function renderActivity(rows) {
    if (!activityTableBody) return;

    activityTableBody.replaceChildren();
    if (!rows.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'No recent access logs available.';
      row.appendChild(cell);
      activityTableBody.appendChild(row);
      return;
    }

    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const nameCell = document.createElement('td');
      const userRow = document.createElement('div');
      userRow.className = 'user-row';
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = (row.name || 'U').charAt(0).toUpperCase();
      const name = document.createElement('span');
      name.textContent = row.name || 'Unknown User';
      userRow.append(avatar, name);
      nameCell.appendChild(userRow);
      tr.appendChild(nameCell);

      [row.email || '—'].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        tr.appendChild(cell);
      });

      const actionCell = document.createElement('td');
      const badge = document.createElement('span');
      const action = String(row.action || 'Access');
      const type = action.toLowerCase().includes('login') ? 'verified' : action.toLowerCase().includes('signup') ? 'genuine' : action.toLowerCase().includes('transaction') ? 'fraud' : 'blocked';
      badge.className = `status-badge status-${type}`;
      badge.textContent = action;
      actionCell.appendChild(badge);
      tr.appendChild(actionCell);

      [row.details || 'No additional details', formatDate(row.created_at)].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value;
        tr.appendChild(cell);
      });
      activityTableBody.appendChild(tr);
    });
  }

  function renderCustomers(rows) {
    if (!customerTableBody) return;
    customerTableBody.replaceChildren();
    if (!rows.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'No customer accounts have been created yet.';
      row.appendChild(cell);
      customerTableBody.appendChild(row);
      return;
    }

    rows.forEach((customer) => {
      const row = document.createElement('tr');
      row.className = 'clickable-row';
      row.tabIndex = 0;
      row.setAttribute('aria-label', `View ${customer.name} account dashboard`);

      const nameCell = document.createElement('td');
      const cellWrap = document.createElement('div');
      cellWrap.className = 'customer-cell';
      const avatar = document.createElement('div');
      avatar.className = 'mini-avatar';
      avatar.textContent = (customer.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
      const name = document.createElement('span');
      name.textContent = customer.name || '—';
      cellWrap.append(avatar, name);
      nameCell.appendChild(cellWrap);
      row.appendChild(nameCell);

      [customer.email, customer.phone, formatDate(customer.created_at)].forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value || '—';
        row.appendChild(cell);
      });
      const open = () => showDetail(`/api/admin/users/${encodeURIComponent(customer.id)}`, `${customer.name} · Customer dashboard`);
      row.addEventListener('click', open);
      row.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(); });
      customerTableBody.appendChild(row);
    });
  }

  function addDetailHero(title, subtitle, avatarText) {
    const hero = document.createElement('div');
    hero.className = 'detail-hero';
    const avatar = document.createElement('div');
    avatar.className = 'detail-hero-avatar';
    avatar.textContent = avatarText || 'A';
    const meta = document.createElement('div');
    meta.className = 'detail-hero-meta';
    const heading = document.createElement('h3');
    heading.textContent = title;
    const sub = document.createElement('p');
    sub.textContent = subtitle;
    meta.append(heading, sub);
    hero.append(avatar, meta);
    detailBody.appendChild(hero);
  }

  function appendDetailGrid(items) {
    const grid = document.createElement('dl');
    grid.className = 'admin-detail-grid';
    items.forEach(([label, value]) => {
      const item = document.createElement('div');
      const term = document.createElement('dt');
      term.textContent = label;
      const definition = document.createElement('dd');
      definition.textContent = value == null || value === '' ? '—' : String(value);
      item.append(term, definition);
      grid.appendChild(item);
    });
    detailBody.appendChild(grid);
  }

  async function showDetail(endpoint, title) {
    detailTitle.textContent = title;
    detailBody.replaceChildren();
    const loading = document.createElement('p');
    loading.textContent = 'Loading account records…';
    detailBody.appendChild(loading);
    detailDialog.showModal();

    try {
      const token = localStorage.getItem('securepayAdminToken');
      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load detail view.');
      detailBody.replaceChildren();

      if (result.user) {
        const user = result.user;
        const totals = result.totals || {};
        addDetailHero(user.name || 'Customer', `${user.email || '—'} • ${user.phone || '—'}`, (user.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase());
        appendDetailGrid([
          ['Customer ID', user.id], ['Email', user.email], ['Mobile', user.phone],
          ['Joined', formatDate(user.created_at)], ['Recorded transfers', totals.count || 0],
          ['Recorded value', `₹${Number(totals.amount || 0).toLocaleString('en-IN')}`],
          ['High-risk transfers', totals.highRisk || 0], ['Account role', user.role],
        ]);

        const heading = document.createElement('h3');
        heading.className = 'admin-detail-subtitle';
        heading.textContent = 'Recent transfer activity';
        detailBody.appendChild(heading);
        const chartHost = document.createElement('div');
        chartHost.className = 'admin-detail-chart';
        const canvas = document.createElement('canvas');
        canvas.id = 'userDetailCanvas';
        chartHost.appendChild(canvas);
        detailBody.appendChild(chartHost);
        const transactions = result.transactions || [];
        if (window.adminUserDetailChart) window.adminUserDetailChart.destroy();
        window.adminUserDetailChart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: transactions.slice(0, 8).reverse().map((transaction) => new Date(transaction.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
            datasets: [{
              label: 'Sandbox transfer amount (₹)',
              data: transactions.slice(0, 8).reverse().map((transaction) => Number(transaction.amount || 0)),
              backgroundColor: '#48b7d2',
              borderRadius: 5,
            }],
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#b7cfe9' }, grid: { display: false } }, y: { ticks: { color: '#b7cfe9' }, grid: { color: 'rgba(255,255,255,.06)' } } } },
        });
        const list = document.createElement('ul');
        list.className = 'admin-detail-reasons';
        transactions.slice(0, 5).forEach((transaction) => {
          const item = document.createElement('li');
          item.textContent = `${formatDate(transaction.created_at)} · ${transaction.receiver_name} · ₹${Number(transaction.amount || 0).toLocaleString('en-IN')} · ${transaction.risk_level} risk`;
          list.appendChild(item);
        });
        if (!transactions.length) list.textContent = 'No transfer history is recorded for this account.';
        detailBody.appendChild(list);
      } else if (result.transaction) {
        const transaction = result.transaction;
        const riskLabel = transaction.risk_level || 'Low';
        addDetailHero(
          `${transaction.receiver_name || 'Transfer'} • ${riskLabel} risk`,
          `${transaction.status || 'Recorded'} • ${formatDate(transaction.created_at)}`,
          (transaction.receiver_name || 'T').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
        );
        appendDetailGrid([
          ['Transaction ID', transaction.id], ['Customer', transaction.customer_name],
          ['Customer email', transaction.email], ['Customer mobile', transaction.phone],
          ['Recipient', transaction.receiver_name], ['Recipient ID', transaction.receiver_number],
          ['Amount', `₹${Number(transaction.amount || 0).toLocaleString('en-IN')}`],
          ['Type', transaction.transaction_type], ['Status', transaction.status],
          ['Risk level', riskLabel], ['Risk score', `${transaction.risk_score || 0}/100`],
          ['Confidence', `${transaction.confidence || 0}%`], ['Recorded', formatDate(transaction.created_at)],
        ]);

        const riskSummary = document.createElement('div');
        riskSummary.style.display = 'flex';
        riskSummary.style.alignItems = 'center';
        riskSummary.style.justifyContent = 'space-between';
        riskSummary.style.gap = '12px';
        riskSummary.style.margin = '18px 0 10px';
        riskSummary.style.padding = '12px 14px';
        riskSummary.style.border = '1px solid rgba(130, 178, 255, 0.18)';
        riskSummary.style.borderRadius = '12px';
        riskSummary.style.background = 'rgba(14, 25, 40, 0.85)';

        const summaryLabel = document.createElement('strong');
        summaryLabel.textContent = 'Risk review summary';
        const badge = document.createElement('span');
        badge.className = `status-badge status-${String(riskLabel).toLowerCase()}`;
        badge.textContent = `${riskLabel} risk · ${transaction.risk_score || 0}/100`;
        riskSummary.append(summaryLabel, badge);
        detailBody.appendChild(riskSummary);

        const heading = document.createElement('h3');
        heading.className = 'admin-detail-subtitle';
        heading.textContent = 'Risk review reasons';
        detailBody.appendChild(heading);

        const list = document.createElement('ul');
        list.className = 'admin-detail-reasons';
        const reasons = Array.isArray(transaction.reasons) && transaction.reasons.length
          ? transaction.reasons
          : [`Transaction amount ${transaction.amount ? `₹${Number(transaction.amount).toLocaleString('en-IN')}` : '—'} reviewed with ${riskLabel.toLowerCase()} risk score.`];
        reasons.forEach((reason) => {
          const item = document.createElement('li');
          item.textContent = reason;
          list.appendChild(item);
        });
        detailBody.appendChild(list);
      }
    } catch (error) {
      detailBody.replaceChildren();
      const message = document.createElement('p');
      message.textContent = error.message || 'Unable to load detail view.';
      detailBody.appendChild(message);
    }
  }

  function renderTransactions(rows) {
    if (!transactionTableBody) return;
    transactionTableBody.replaceChildren();
    if (!rows.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.textContent = 'No transactions have been recorded.';
      row.appendChild(cell);
      transactionTableBody.appendChild(row);
      return;
    }

    rows.forEach((transaction) => {
      const row = document.createElement('tr');
      row.className = 'clickable-row';
      row.tabIndex = 0;
      row.setAttribute('aria-label', `View transaction ${transaction.id} details`);
      const amount = `₹${Number(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      const customerCell = document.createElement('td');
      const customerWrap = document.createElement('div');
      customerWrap.className = 'transaction-cell';
      const customerIcon = document.createElement('div');
      customerIcon.className = 'mini-avatar';
      customerIcon.textContent = (transaction.customer_name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
      const customerText = document.createElement('span');
      customerText.textContent = transaction.customer_name || '—';
      customerWrap.append(customerIcon, customerText);
      customerCell.appendChild(customerWrap);
      row.appendChild(customerCell);

      const payeeCell = document.createElement('td');
      payeeCell.textContent = transaction.receiver_name || '—';
      row.appendChild(payeeCell);
      const amountCell = document.createElement('td');
      amountCell.textContent = amount;
      row.appendChild(amountCell);
      const typeCell = document.createElement('td');
      typeCell.textContent = transaction.transaction_type || '—';
      row.appendChild(typeCell);
      const riskCell = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `status-badge status-${String(transaction.risk_level || 'low').toLowerCase()}`;
      badge.textContent = `${transaction.status || 'Recorded'} · ${transaction.risk_level || 'Low'} (${transaction.risk_score || 0}/100)`;
      riskCell.appendChild(badge);
      row.appendChild(riskCell);
      const timeCell = document.createElement('td');
      timeCell.textContent = formatDate(transaction.created_at);
      row.appendChild(timeCell);

      const open = () => showDetail(`/api/admin/transactions/${encodeURIComponent(transaction.id)}`, `Transaction ${transaction.id} · Review details`);
      row.addEventListener('click', open);
      row.addEventListener('keydown', (event) => { if (event.key === 'Enter') open(); });
      transactionTableBody.appendChild(row);
    });
  }

  function renderBankList(banks) {
    if (!bankListEl) return;

    bankListEl.innerHTML = '';
    if (!banks.length) {
      bankListEl.innerHTML = '<div class="bank-item"><div>No banks available.</div></div>';
      return;
    }

    banks.forEach((bank) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bank-item' + (selectedBankId === bank.id ? ' active' : '');
      const logo = document.createElement('div');
      logo.className = 'bank-logo';
      logo.textContent = bankLogo(bank.name);
      const info = document.createElement('div');
      const name = document.createElement('div');
      name.className = 'bank-name';
      name.textContent = bank.name || 'Bank';
      const type = document.createElement('div');
      type.className = 'bank-type';
      type.textContent = bank.bank_type || 'Banking Partner';
      info.append(name, type);
      button.append(logo, info);
      button.addEventListener('click', () => {
        selectedBankId = bank.id;
        renderBankList(banks);
        renderBankDetail(bank);
      });
      bankListEl.appendChild(button);
    });
  }

  function renderBankDetail(bank) {
    if (!bankDetailEl || !bank) return;

    const related = opportunitiesCache.filter((op) => String(op.bank_id) === String(bank.id) || (op.bank_name && op.bank_name === bank.name));

    bankDetailEl.innerHTML = `
      <div class="bank-detail-head">
        <div class="bank-detail-logo">${escapeHtml(bankLogo(bank.name))}</div>
        <div>
          <div class="bank-detail-title">${escapeHtml(bank.name || 'Bank Details')}</div>
          <div class="bank-type">${escapeHtml(bank.bank_type || 'Banking Partner')}</div>
        </div>
      </div>

      <div class="bank-detail-metadata">
        <div class="meta-box">
          <div class="meta-label">Headquarters</div>
          <div class="meta-value">${escapeHtml(bank.headquarters || 'Not available')}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Website</div>
          <div class="meta-value">${escapeHtml(bank.website || 'Not available')}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Status</div>
          <div class="meta-value">${escapeHtml(bank.status || 'active')}</div>
        </div>
        <div class="meta-box">
          <div class="meta-label">Opportunities</div>
          <div class="meta-value">${related.length}</div>
        </div>
      </div>

      <div class="bank-detail-copy">${escapeHtml(bank.description || 'This bank is connected to the fraud detection platform and is tracked for monitoring, risk analysis, and transaction activity.')}</div>

      <div class="panel-header" style="margin-top: 20px; margin-bottom: 12px;">
        <span>Available Opportunities</span>
      </div>
      <div class="opportunity-list">
        ${related.length ? related.map((op) => `
          <div class="opportunity-item">
            <strong>${escapeHtml(op.title || 'Opportunity')}</strong>
            <span>${escapeHtml(op.location || 'Location unavailable')} • ${escapeHtml(op.salary || 'Salary not disclosed')} • ${escapeHtml(op.deadline || 'Deadline not specified')}</span>
          </div>
        `).join('') : '<div class="opportunity-item"><strong>No opportunities</strong><span>No active openings are currently listed for this bank.</span></div>'}
      </div>
    `;
  }

  async function loadAdminData() {
    try {
      const token = localStorage.getItem('securepayAdminToken');

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const [summaryResponse, usersResponse, transactionsResponse, activityResponse, banksResponse, opportunitiesResponse] = await Promise.all([
        fetch('/api/admin/summary', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/transactions', { headers }),
        fetch('/api/admin/activity', { headers }),
        fetch('/api/banks'),
        fetch('/api/opportunities'),
      ]);

      const summaryResult = await summaryResponse.json();
      const usersResult = await usersResponse.json();
      const transactionsResult = await transactionsResponse.json();
      const activityResult = await activityResponse.json();
      const banksResult = await banksResponse.json();
      const opportunitiesResult = await opportunitiesResponse.json();

      if (!summaryResponse.ok) {
        throw new Error(summaryResult.message || 'Unable to load summary');
      }

      if (!usersResponse.ok) {
        throw new Error(usersResult.message || 'Unable to load users');
      }

      if (!transactionsResponse.ok) {
        throw new Error(transactionsResult.message || 'Unable to load transactions');
      }

      if (!activityResponse.ok) {
        throw new Error(activityResult.message || 'Unable to load activity logs');
      }

      const totals = summaryResult.totals || {};
      const users = usersResult.users || [];
      const customers = users.filter((user) => user.role === 'user');
      const transactions = transactionsResult.transactions || [];
      const activity = activityResult.activity || [];
      const daily = summaryResult.daily || [];
      const trendLabels = daily.length ? daily.map((row) => row.day) : ['No transactions'];
      banksCache = banksResult.banks || [];
      opportunitiesCache = opportunitiesResult.opportunities || [];

      totalUsersEl.textContent = customers.length || 0;
      totalTransactionsEl.textContent = totals.total || 0;
      fraudCasesEl.textContent = totals.highRisk || 0;
      highRiskUsersEl.textContent = totals.highRiskUsers || 0;

      renderActivity(activity);
      renderCustomers(customers);
      renderTransactions(transactions);
      if (banksCache.length) {
        selectedBankId = banksCache[0].id;
        renderBankList(banksCache);
        renderBankDetail(banksCache[0]);
      }

      const ctxOverview = document.getElementById('overviewChart');
      const ctxStatus = document.getElementById('statusChart');
      const ctxFraudTrend = document.getElementById('fraudTrendChart');
      const ctxCategory = document.getElementById('categoryChart');

      if (ctxOverview && window.adminOverviewChart) window.adminOverviewChart.destroy();
      if (ctxStatus && window.adminStatusChart) window.adminStatusChart.destroy();
      if (ctxFraudTrend && window.adminFraudTrendChart) window.adminFraudTrendChart.destroy();
      if (ctxCategory && window.adminCategoryChart) window.adminCategoryChart.destroy();

      const chartLabels = daily.length ? daily.map((row) => row.day) : ['No data'];
      const overviewSeries = daily.length ? daily.map((row) => Number(row.total || 0)) : [0];
      const fraudSeries = daily.length ? daily.map((row) => Number(row.high_risk || 0)) : [0];

      window.adminOverviewChart = new Chart(ctxOverview, {
        type: 'line',
        data: {
          labels: chartLabels,
          datasets: [{
            label: 'Transactions',
            data: overviewSeries,
            borderColor: '#45b6ff',
            backgroundColor: 'rgba(69,182,255,0.14)',
            fill: true,
            tension: 0.38,
            borderWidth: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#b7cfe9' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#b7cfe9' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          },
        },
      });

      window.adminStatusChart = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Low risk', 'Medium risk', 'High risk'],
          datasets: [{
            data: [totals.lowRisk || 0, totals.mediumRisk || 0, totals.highRisk || 0],
            backgroundColor: ['#3ae0a4', '#f5b455', '#ff5f6d'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#dfeeff' } } },
        },
      });

      window.adminFraudTrendChart = new Chart(ctxFraudTrend, {
        type: 'bar',
        data: {
          labels: chartLabels,
          datasets: [{
            data: fraudSeries,
            backgroundColor: '#ff5a5f',
            borderRadius: 7,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#b7cfe9' }, grid: { display: false } },
            y: { ticks: { color: '#b7cfe9' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          },
        },
      });

      window.adminCategoryChart = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
          labels: ['Low risk', 'Medium risk', 'High risk'],
          datasets: [{
            data: [totals.lowRisk || 0, totals.mediumRisk || 0, totals.highRisk || 0],
            backgroundColor: ['#34d399', '#f5b55d', '#ff5f7a'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#dfeeff' } } },
        },
      });
    } catch (error) {
      pinError.textContent = error.message || 'Unable to load admin analytics.';
    }
  }

  pinForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const pin = pinInput.value.trim();
    pinError.textContent = 'Checking admin access...';
    try {
      const response = await fetch('/api/admin/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to unlock admin console.');
      localStorage.setItem('securepayAdminToken', result.token);
      pinError.textContent = '';
      pinOverlay.classList.add('hidden');
      adminDashboardContent.classList.remove('hidden');
      await loadAdminData();
    } catch (error) {
      pinError.textContent = error.message || 'Unable to unlock admin console.';
      pinInput.focus();
    }
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', (event) => {
      if (item.id === 'adminLogout') {
        event.preventDefault();
        localStorage.removeItem('securepayAdminToken');
        adminDashboardContent.classList.add('hidden');
        pinOverlay.classList.remove('hidden');
        pinInput.value = '';
        pinError.textContent = 'Admin session ended.';
        pinInput.focus();
        return;
      }

      document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.remove('active'));
      item.classList.add('active');
      const target = document.querySelector(item.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  if (localStorage.getItem('securepayAdminToken')) {
    pinOverlay.classList.add('hidden');
    adminDashboardContent.classList.remove('hidden');
    await loadAdminData();
  } else {
    pinInput.focus();
  }
});

