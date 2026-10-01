// ==========================================
// AI SecurePay - Risk Analysis
// ==========================================

// ==========================================
// PAGE LOAD
// ==========================================

window.addEventListener("load",()=>{

    const container=document.querySelector(".container");

    if(container){

        container.style.opacity="0";

        container.style.transform="translateY(20px)";

        setTimeout(()=>{

            container.style.transition=".6s ease";

            container.style.opacity="1";

            container.style.transform="translateY(0)";

        },200);

    }

});

// ==========================================
// SELECT ELEMENTS
// ==========================================

const riskScore=document.getElementById("riskScore");

const riskBadge=document.getElementById("riskBadge");

const riskMessage=document.getElementById("riskMessage");

const needle=document.getElementById("needle");

const infoBtn=document.getElementById("infoBtn");

const learnMoreBtn=document.getElementById("learnMoreBtn");

const securityRisk=document.getElementById("securityRisk");

const deviceRisk=document.getElementById("deviceRisk");

const transactionRisk=document.getElementById("transactionRisk");

const payeeRisk=document.getElementById("payeeRisk");

const fraudRisk=document.getElementById("fraudRisk");

// ==========================================
// LOAD TRANSACTIONS
// ==========================================

let transactions=

JSON.parse(

localStorage.getItem("transactionHistory")

) || [];

// ==========================================
// DEFAULT VALUES
// ==========================================

const accountProfile = JSON.parse(localStorage.getItem('securepayUser') || '{}');
const latestTransaction = transactions[0] || null;
const transactionAmount = (transaction) => Number(String(transaction?.amount || 0).replace(/[₹,]/g, '')) || 0;
const transactionRiskScore = (transaction) => Number(transaction?.riskScore ?? transaction?.risk_score ?? 0);
const score = transactions.length ? Math.min(100, Math.max(...transactions.slice(0, 10).map(transactionRiskScore))) : 0;
const suspiciousTransactions = transactions.filter((transaction) => transaction.status === 'Suspicious' || transaction.riskLevel === 'High' || transaction.risk_level === 'High').length;
const highAmountTransactions = transactions.filter((transaction) => transactionAmount(transaction) > 5000).length;
const failedTransactions = transactions.filter((transaction) => transaction.status === 'Failed').length;

const riskPercentElement=document.getElementById('riskPercent');
const trendValueElement=document.getElementById('trendValue');
const riskHistoryChart=document.getElementById('riskHistoryChart');
const riskHistoryLabels=document.getElementById('riskHistoryLabels');
if(riskPercentElement) riskPercentElement.textContent=String(suspiciousTransactions);
if(transactions.length){
    const history=transactions.slice(0,7).reverse();
    if(trendValueElement) trendValueElement.textContent=`Latest score ${transactionRiskScore(transactions[0])}/100`;
    if(riskHistoryChart){
        riskHistoryChart.replaceChildren();
        history.forEach((transaction)=>{
            const dot=document.createElement('span');
            dot.className=`dot${transactionRiskScore(transaction)>=70?' active':''}`;
            dot.title=`${new Date(transaction.created_at||transaction.date||Date.now()).toLocaleString()} · risk ${transactionRiskScore(transaction)}/100`;
            riskHistoryChart.appendChild(dot);
        });
    }
    if(riskHistoryLabels){
        riskHistoryLabels.replaceChildren();
        history.forEach((transaction)=>{
            const label=document.createElement('span');
            label.textContent=new Date(transaction.created_at||transaction.date||Date.now()).toLocaleDateString('en-IN',{day:'2-digit',month:'short'});
            riskHistoryLabels.appendChild(label);
        });
    }
}else{
    if(trendValueElement) trendValueElement.textContent='Awaiting first transfer';
    if(riskHistoryChart) riskHistoryChart.textContent='No risk history yet';
}
// ==========================================
// UPDATE RISK SCORE
// ==========================================

updateRiskAnalysis();

function updateRiskAnalysis(){

    // ----------------------------
    // LOW RISK
    // ----------------------------

    if(!transactions.length){
        riskBadge.className='badge low';
        riskBadge.innerText='Awaiting data';
        riskMessage.innerText='Record a demo transfer to calculate an account-specific risk score.';
        [securityRisk,deviceRisk,transactionRisk,payeeRisk,fraudRisk].forEach((badge)=>{
            badge.className='status low';
            badge.innerText='Not assessed';
        });
        document.getElementById('transactionStatus').innerText='No transaction history is available yet.';
        document.getElementById('fraudStatus').innerText='No risk alerts are recorded.';
        needle.style.transform='translateX(-50%) rotate(-55deg)';
    }
    else if(score<=30){

        riskBadge.className="badge low";

        riskBadge.innerText="Low Risk";

        riskMessage.innerText=transactions.length
            ? "No high-risk activity is present in the saved transactions."
            : "Not enough transaction history yet. Risk details will update after a demo transfer.";

        securityRisk.className="status low";

        securityRisk.innerText="Low Risk";

        deviceRisk.className="status low";

        deviceRisk.innerText="Low Risk";

        transactionRisk.className="status low";

        transactionRisk.innerText="Low Risk";

        payeeRisk.className="status low";

        payeeRisk.innerText="Low Risk";

        fraudRisk.className="status low";

        fraudRisk.innerText="Low Risk";

        document.getElementById("transactionStatus").innerText=
        "Normal transaction behaviour detected.";

        document.getElementById("fraudStatus").innerText=
        "No fraud alerts found.";

        needle.style.transform=
        "translateX(-50%) rotate(-55deg)";

    }

    // ----------------------------
    // MEDIUM RISK
    // ----------------------------

    else if(score<70){

        riskBadge.className="badge medium";

        riskBadge.innerText="Medium Risk";

        riskMessage.innerText=
        "Some unusual activity detected. Please review recent transactions.";

        transactionRisk.className="status medium";

        transactionRisk.innerText="Medium Risk";

        fraudRisk.className="status medium";

        fraudRisk.innerText="Medium Risk";

        document.getElementById("transactionStatus").innerText=
        "High-value transactions detected.";

        document.getElementById("fraudStatus").innerText=
        "AI recommends reviewing recent activity.";

        needle.style.transform=
        "translateX(-50%) rotate(0deg)";

    }

    // ----------------------------
    // HIGH RISK
    // ----------------------------

    else{

        riskBadge.className="badge high";

        riskBadge.innerText="High Risk";

        riskMessage.innerText=
        "Suspicious activity detected. Verify your account immediately.";

        transactionRisk.className="status high";

        transactionRisk.innerText="High Risk";

        fraudRisk.className="status high";

        fraudRisk.innerText="High Risk";

        document.getElementById("transactionStatus").innerText=
        "Multiple suspicious transactions detected.";

        document.getElementById("fraudStatus").innerText=
        "Potential fraud detected.";

        needle.style.transform=
        "translateX(-50%) rotate(55deg)";

    }

    // Animate Score

    animateScore(score);

}

// ==========================================
// SCORE ANIMATION
// ==========================================

function animateScore(target){

    if(!transactions.length){
        riskScore.innerText='—';
        return;
    }

    let current=0;

    const timer=setInterval(()=>{

        current++;

        riskScore.innerText=current;

        if(current>=target){

            clearInterval(timer);

        }

    },20);

}
// ==========================================
// RECENT ACTIVITY IMPACT
// ==========================================

// ==========================================
// INFO BUTTON
// ==========================================

infoBtn.addEventListener("click",()=>{

    alert(

`AI Risk Analysis

• Transaction Behaviour

• Device Verification

• Location Analysis

• Payee Trust Score

• Fraud Detection

• Behaviour Monitoring

Risk score is updated automatically after every successful transaction.`

    );

});

// ==========================================
// LEARN MORE BUTTON
// ==========================================

learnMoreBtn.addEventListener("click",()=>openRiskDetails('Account Security'));

// ==========================================
// RECOMMENDATION CARDS
// ==========================================

const recommendations=

document.querySelectorAll(".recommend-card");

recommendations.forEach(card=>{

    card.addEventListener("click",()=>{

        const title=

        card.querySelector("h3").innerText;

        alert(

`${title}

AI SecurePay recommends following this security advice to reduce your account risk.`

        );

    });

});

// ==========================================
// RISK FACTOR DETAILS
// ==========================================

const riskDialog = document.getElementById('riskFactorDialog');
const locationControls = document.getElementById('locationControls');
const locationStatus = document.getElementById('riskLocationStatus');
const locationMap = document.getElementById('riskLocationMap');
const currentReceiver = latestTransaction?.receiver_name || latestTransaction?.receiverName || 'No recent payee';
const currentReceiverId = latestTransaction?.receiver_number || latestTransaction?.receiverNumber || 'Not available';
const latestReasons = (() => {
    const reasons = latestTransaction?.riskReasons || latestTransaction?.reasons || [];
    if (Array.isArray(reasons)) return reasons;
    try { return JSON.parse(reasons); } catch (error) { return []; }
})();

function openRiskDetails(title) {
    if (!riskDialog) return;
    const status = document.querySelector('.risk-badge')?.textContent.trim() || 'Not assessed';
    const hour = new Date().getHours();
    const lateHour = hour >= 23 || hour < 5;
    const currentDevice = navigator.userAgentData?.platform || navigator.platform || 'Browser device';
    const detailByTitle = {
        'Account Security': {
            summary: 'This profile uses password-based sign-in. A live bank connection and second-factor provider are not configured in this demo.',
            evidence: `${accountProfile.name || 'Customer'} · ${accountProfile.email || 'No email'} · ${accountProfile.phone || 'No mobile'}`,
            activity: accountProfile.role === 'admin' ? 'Administrator profile' : 'Customer profile; password is never displayed here.',
            action: 'Use a unique password. Configure a real MFA provider before production use.'
        },
        'Device & Location': {
            summary: 'Device and time context are recorded for transaction risk checks. Precise location is never collected until you choose to share it below.',
            evidence: `${currentDevice} · ${Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time zone'}`,
            activity: `${new Date().toLocaleString()} · ${lateHour ? 'Unusual late/early hour' : 'Typical daytime hour'}`,
            action: 'Share current location only if you want it included in this review.'
        },
        'Transaction Behaviour': {
            summary: transactions.length ? 'Based on saved transactions for this account.' : 'No transactions have been recorded for this account yet.',
            evidence: `${transactions.length} recorded · ${highAmountTransactions} above ₹5,000 · ${failedTransactions} failed`,
            activity: latestTransaction ? `Latest ₹${transactionAmount(latestTransaction).toLocaleString('en-IN')} to ${currentReceiver}` : 'No recent transfer',
            action: latestReasons.length ? latestReasons.join('; ') : 'Continue reviewing each transfer before confirmation.'
        },
        'Payee Profile': {
            summary: 'Payee history is calculated from this account’s saved transfer records.',
            evidence: `${currentReceiver} · ${currentReceiverId}`,
            activity: `${transactions.filter((transaction) => (transaction.receiver_number || transaction.receiverNumber) === currentReceiverId).length} transfers to this payee`,
            action: 'Verify the recipient details before authorizing a new payee.'
        },
        'Fraud & Alerts': {
            summary: 'Only transfers flagged by the server-side risk rules appear here.',
            evidence: `${suspiciousTransactions} high-risk transfer${suspiciousTransactions === 1 ? '' : 's'} in account history`,
            activity: latestReasons.length ? latestReasons.join('; ') : 'No server-generated risk reasons on the latest transfer.',
            action: suspiciousTransactions ? 'Review the flagged transfer and do not repeat it until verified.' : 'No high-risk transfer is currently recorded.'
        }
    };
    const details = detailByTitle[title] || detailByTitle['Account Security'];
    document.getElementById('riskDetailTitle').textContent = title;
    document.getElementById('riskDetailSummary').textContent = details.summary;
    document.getElementById('riskDetailAssessment').textContent = status;
    document.getElementById('riskDetailEvidence').textContent = details.evidence;
    document.getElementById('riskDetailActivity').textContent = details.activity;
    document.getElementById('riskDetailAction').textContent = details.action;
    locationControls.hidden = title !== 'Device & Location';
    locationStatus.textContent = 'Location is not shared. Your browser will ask permission first.';
    locationMap.hidden = true;
    riskDialog.showModal();
}

document.querySelectorAll('.factor-card').forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    const open = () => openRiskDetails(card.querySelector('h3')?.textContent.trim() || 'Account Security');
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open();
        }
    });
});

document.getElementById('riskSummaryButton')?.addEventListener('click', (event) => {
    event.preventDefault();
    openRiskDetails('Transaction Behaviour');
});
document.getElementById('closeRiskDetails')?.addEventListener('click', () => riskDialog.close());
document.getElementById('requestRiskLocation')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
        locationStatus.textContent = 'Location is not supported by this browser.';
        return;
    }
    locationStatus.textContent = 'Waiting for browser permission…';
    navigator.geolocation.getCurrentPosition(({ coords }) => {
        const latitude = coords.latitude.toFixed(5);
        const longitude = coords.longitude.toFixed(5);
        locationStatus.textContent = `Shared for this review: ${latitude}, ${longitude}. This location is not saved.`;
        locationMap.href = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
        locationMap.hidden = false;
    }, () => {
        locationStatus.textContent = 'Location was not shared. You can still review device and time context.';
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
});
// ==========================================
// AI FRAUD DETECTION ENGINE
// ==========================================

let fraudDetected=false;

// High Amount Transactions

if(highAmountTransactions>=3){
    fraudDetected=true;

}

// Failed Transactions

if(failedTransactions>=2){
    fraudDetected=true;

}

// Suspicious Transactions

if(suspiciousTransactions>=1){
    fraudDetected=true;

}

// ==========================================
// UPDATE DEVICE RISK
// ==========================================

const deviceStatus=document.getElementById("deviceStatus");

if(!transactions.length){
    deviceStatus.innerText='No transfer has been checked on this browser yet.';
}
else if(score<=30){

    deviceStatus.innerText=

    "Trusted device and familiar location.";

}

else if(score<70){

    deviceStatus.innerText=

    "New location detected recently.";

    deviceRisk.className="status medium";

    deviceRisk.innerText="Medium Risk";

}

else{

    deviceStatus.innerText=

    "Unknown device login detected.";

    deviceRisk.className="status high";

    deviceRisk.innerText="High Risk";

}

// ==========================================
// UPDATE PAYEE RISK
// ==========================================

const payeeStatus=document.getElementById("payeeStatus");

if(!transactions.length){
    payeeStatus.innerText='Payee trust is not assessed until a transfer is recorded.';
}
else if(score<=30){

    payeeStatus.innerText=

    "Payments sent to verified contacts.";

}

else if(score<70){

    payeeStatus.innerText=

    "New beneficiary detected.";

    payeeRisk.className="status medium";

    payeeRisk.innerText="Medium Risk";

}

else{

    payeeStatus.innerText=

    "Multiple unknown beneficiaries found.";

    payeeRisk.className="status high";

    payeeRisk.innerText="High Risk";

}

// ==========================================
// FRAUD ALERT
// ==========================================

// ==========================================
// RECALCULATE RISK
// ==========================================

updateRiskAnalysis();

// ==========================================
// AUTO REFRESH
// ==========================================

window.addEventListener("storage",()=>{

    location.reload();

});

// ==========================================
// PAGE READY
// ==========================================

console.log("AI Risk Analysis Loaded Successfully");
// ==========================================
// BACK BUTTON
// ==========================================

const backBtn=document.querySelector(".back-btn");

if(backBtn){

    backBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="dashboard.html";

    });

}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown",(e)=>{

    // ESC → Dashboard

    if(e.key==="Escape"){

        window.location.href="dashboard.html";

    }

    // R → Refresh Risk Analysis

    if(e.key==="r" || e.key==="R"){

        location.reload();

    }

});

// ==========================================
// GRAPH ANIMATION
// ==========================================

const dots=document.querySelectorAll(".dot");

dots.forEach((dot,index)=>{

    setTimeout(()=>{

        dot.style.transform="scale(1.25)";

        setTimeout(()=>{

            dot.style.transform="scale(1)";

        },350);

    },index*180);

});

// ==========================================
// SUMMARY CARD EFFECT
// ==========================================

const summaryCards=document.querySelectorAll(".summary-item");

summaryCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.transform="translateY(-4px)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="translateY(0)";

    });

});

// ==========================================
// FACTOR CARD EFFECT
// ==========================================

const factorCards=document.querySelectorAll(".factor-card");

factorCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 25px rgba(37,99,235,.30)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});

// ==========================================
// RECOMMENDATION CARD EFFECT
// ==========================================

recommendations.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 20px rgba(37,99,235,.25)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});

// ==========================================
// PAGE EXIT ANIMATION
// ==========================================

window.addEventListener("beforeunload",()=>{

    const container=document.querySelector(".container");

    if(container){

        container.style.opacity="0";

        container.style.transform="translateY(20px)";

    }

});

// ==========================================
// AUTO UPDATE EVERY 30 SECONDS
// ==========================================

setInterval(()=>{

    let latestTransactions=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    if(latestTransactions.length!==transactions.length){

        location.reload();

    }

},30000);

// ==========================================
// AI STATUS MESSAGE
// ==========================================

console.log(

"🛡 AI SecurePay Risk Analysis Ready"

);

// ==========================================
// END OF FILE
// ==========================================