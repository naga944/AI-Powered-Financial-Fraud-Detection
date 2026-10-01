// ==========================================
// AI SecurePay - My QR Page
// ==========================================

const accountUser = JSON.parse(localStorage.getItem('securepayUser') || '{}');
let accountName = accountUser.name || 'SecurePay customer';
let accountPhone = accountUser.phone || 'Mobile number unavailable';
let accountPaymentId = 'Loading...';
const myQrImage = document.getElementById('myQrImage');
const qrUserName = document.querySelector('.user-details h2');
const qrUserPhone = document.querySelector('.user-details p');
const qrUserInitial = document.querySelector('.profile-circle');
const securepayPaymentId = document.getElementById('securepayPaymentId');

async function loadSignedQr() {
    const api = window.AISecurePayAPI;
    if (!api?.getToken()) {
        window.location.href = 'mobile-verification.html';
        return;
    }
    try {
        const profile = await api.request('/api/qr/me');
        accountName = profile.name;
        accountPhone = profile.phone;
        accountPaymentId = profile.paymentId;
        if (qrUserName) qrUserName.textContent = accountName;
        if (qrUserPhone) qrUserPhone.textContent = accountPhone;
        if (qrUserInitial) qrUserInitial.textContent = accountName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
        if (securepayPaymentId) securepayPaymentId.textContent = accountPaymentId;
        if (myQrImage) myQrImage.src = profile.qr;
        await loadRecentTransactions(api);
    } catch (error) {
        if (securepayPaymentId) securepayPaymentId.textContent = error.message || 'Unable to create QR';
    }
}

async function loadRecentTransactions(api) {
    const section = document.getElementById('myQrTransactions');
    if (!section) return;
    const heading = section.querySelector('.section-header');
    section.replaceChildren(heading);
    try {
        const result = await api.request('/api/transactions');
        const transactions = result.transactions || [];
        transactions.slice(0, 5).forEach((transaction) => {
            const card = document.createElement('article');
            card.className = 'transaction-card';
            const left = document.createElement('div');
            left.className = 'transaction-left';
            const avatar = document.createElement('div');
            avatar.className = 'avatar blue';
            avatar.textContent = (transaction.receiver_name || 'T').split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
            const details = document.createElement('div');
            details.className = 'transaction-details';
            const recipient = document.createElement('h3');
            recipient.textContent = transaction.receiver_name || 'Transfer';
            const time = document.createElement('p');
            time.textContent = `${transaction.transaction_type || 'transfer'} · ${new Date(transaction.created_at).toLocaleString('en-IN')}`;
            details.append(recipient, time);
            left.append(avatar, details);
            const right = document.createElement('div');
            right.className = 'transaction-right';
            const amount = document.createElement('h3');
            amount.className = 'success';
            amount.textContent = `− ₹${Number(transaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            const status = document.createElement('span');
            status.textContent = transaction.risk_level === 'High' ? 'Review' : 'Recorded';
            right.append(amount, status);
            card.append(left, right);
            section.appendChild(card);
        });
        if (!transactions.length) {
            const empty = document.createElement('p');
            empty.className = 'empty-transactions';
            empty.textContent = 'No transfers recorded for this account yet.';
            section.appendChild(empty);
        }
    } catch (error) {
        const empty = document.createElement('p');
        empty.textContent = 'Transaction history is temporarily unavailable.';
        section.appendChild(empty);
    }
}

loadSignedQr();

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load", () => {

    const container = document.querySelector(".container");

    if (container) {

        container.style.opacity = "0";
        container.style.transform = "translateY(25px)";

        setTimeout(() => {

            container.style.transition = "0.6s ease";

            container.style.opacity = "1";

            container.style.transform = "translateY(0)";

        }, 200);

    }

});

// ==========================================
// BACK BUTTON
// ==========================================

const backBtn = document.querySelector(".back-btn");

if (backBtn) {

    backBtn.addEventListener("click", function (e) {

        e.preventDefault();

        window.location.href = "payment-options.html";

    });

}

// ==========================================
// HELP BUTTON
// ==========================================

const helpBtn = document.querySelector(".help-btn");

if (helpBtn) {

    helpBtn.addEventListener("click", () => {

        alert(

`My QR Help

• Share your QR to receive money.

• Only the SecurePay demo scanner accepts this signed code.

• Never share your UPI PIN.

• Its signature is verified by the SecurePay server.`

        );

    });

}

// ==========================================
// SHARE QR
// ==========================================

const shareQR = document.getElementById("shareQR");

if (shareQR) {

    shareQR.addEventListener("click", async () => {
        const shareData = { title: 'My SecurePay QR', text: `Pay ${accountName} with SecurePay ID ${accountPaymentId}` };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(`${accountName}: ${accountPaymentId}`);
                shareQR.title = 'SecurePay ID copied';
            }
        } catch (error) {
            if (error.name !== 'AbortError') shareQR.title = 'Sharing is unavailable in this browser';
        }

    });

}

// ==========================================
// DOWNLOAD QR
// ==========================================

const downloadQR = document.getElementById("downloadQR");

if (downloadQR) {

    downloadQR.addEventListener("click", () => {
        if (!myQrImage?.src) return;
        const link = document.createElement('a');
        link.href = myQrImage.src;
        link.download = 'securepay-qr.png';
        link.click();

    });

}

// ==========================================
// PRINT QR
// ==========================================

const printQR = document.getElementById("printQR");

if (printQR) {

    printQR.addEventListener("click", () => {

        window.print();

    });

}
// ==========================================
// RECENT TRANSACTIONS
// ==========================================

const transactionCards = document.querySelectorAll(".transaction-card");

transactionCards.forEach(card => {

    card.addEventListener("click", () => {

        const merchant = card.querySelector(".transaction-details h3").innerText;

        alert(

`Transaction Details

Merchant : ${merchant}

Status : Successful

Verified by AI Fraud Detection`

        );

    });

});

// ==========================================
// AI FRAUD PROTECTION CARD
// ==========================================

const fraudCard = document.querySelector(".fraud-card");

if (fraudCard) {

    fraudCard.addEventListener("click", () => {

        alert(

`SecurePay QR Verification

This demo verifies signed SecurePay QR codes only.

It does not accept generic UPI codes or receive real funds.`

        );

    });

}

// ==========================================
// PAYMENT SAFETY TIPS
// ==========================================

const tipsCard = document.querySelector(".tips-card");

if (tipsCard) {

    tipsCard.addEventListener("click", () => {

        alert(

`Safety Tips

• Never share your UPI PIN.

• Never share OTP.

• Scan trusted QR Codes only.

• Verify the receiver before paying.

• Report suspicious activity immediately.`

        );

    });

}

// ==========================================
// QR IMAGE CLICK
// ==========================================

const qrImage = document.querySelector(".qr-image");

if (qrImage) {

    qrImage.addEventListener("click", () => {

        qrImage.style.transform = "scale(1.08)";

        setTimeout(() => {

            qrImage.style.transform = "scale(1)";

        }, 300);

    });

}

// ==========================================
// ACTION BUTTON ANIMATION
// ==========================================

const actionButtons = document.querySelectorAll(".action-btn");

actionButtons.forEach(button => {

    button.addEventListener("click", () => {

        button.style.transform = "scale(.94)";

        setTimeout(() => {

            button.style.transform = "scale(1)";

        }, 150);

    });

});

// ==========================================
// BOTTOM NAVIGATION
// ==========================================

const navItems = document.querySelectorAll(".bottom-nav a");

navItems.forEach(item => {

    item.addEventListener("click", function () {

        navItems.forEach(link => {

            link.classList.remove("active");

        });

        this.classList.add("active");

    });

});

// ==========================================
// SECURITY CARD ANIMATION
// ==========================================

const securityCard = document.querySelector(".security-card");

if (securityCard) {

    securityCard.addEventListener("mouseenter", () => {

        securityCard.style.boxShadow =
            "0 0 30px rgba(37,99,235,.45)";

    });

    securityCard.addEventListener("mouseleave", () => {

        securityCard.style.boxShadow = "";

    });

}

// ==========================================
// END OF FILE
// ==========================================