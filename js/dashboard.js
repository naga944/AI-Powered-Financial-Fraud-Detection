// ==========================================
// AI SecurePay Dashboard
// ==========================================

// ==========================================
// Welcome Animation
// ==========================================

window.addEventListener("load", () => {

    const welcome = document.querySelector(".welcome-section");

    if (welcome) {

        welcome.style.opacity = "0";
        welcome.style.transform = "translateY(30px)";

        setTimeout(() => {

            welcome.style.transition = "0.8s ease";

            welcome.style.opacity = "1";
            welcome.style.transform = "translateY(0)";

        },300);

    }

});

// ==========================================
// Card Click Animation
// ==========================================

const cards = document.querySelectorAll(".transfer-card,.service-card");

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        card.style.transform="scale(.95)";

        setTimeout(()=>{

            card.style.transform="scale(1)";

        },150);

    });

});

// ==========================================
// AI Insight
// ==========================================

const aiInsight=document.getElementById("aiInsight");

if(aiInsight){

    aiInsight.addEventListener("click",()=>{

        alert(

`AI Insight

✔ AI Protection Active

✔ Risk Score : LOW

✔ No suspicious transaction detected.

Your account is secure.`

        );

    });

}

// ==========================================
// Notification
// ==========================================

const notification=document.querySelector(".notification");

if(notification){

notification.addEventListener("click",()=>{

alert(

`Notifications

• No Fraud Detected

• AI Scan Completed

• Risk Score Updated`

);

const badge=document.querySelector(".notification span");

if(badge){

badge.style.display="none";

}

});

}

// ==========================================
// Sidebar
// ==========================================

const menu=document.querySelector(".menu");

if(menu){

menu.addEventListener("click",()=>{
const quickMenu = document.getElementById('quickMenu');
if (!quickMenu) return;
quickMenu.hidden = !quickMenu.hidden;
menu.setAttribute('aria-expanded', String(!quickMenu.hidden));

});

}

// ==========================================
// Navigation
// ==========================================

// Payment Scanner

const scanQR=document.getElementById("scanQR");

if(scanQR){

scanQR.onclick=()=>{

window.location.href="payment-options.html";

};

}

// Pay Contact

const payContact = document.getElementById("payContact");

if (payContact) {

    payContact.addEventListener("click", () => {

        window.location.href = "pay-to-contact.html";

    });

}
// Pay Bank

const payBank=document.getElementById("payBank");

if(payBank){

payBank.onclick=()=>{

window.location.href="pay-to-bank.html";

};

}

// Self Account

const selfAccount=document.getElementById("selfAccount");

if(selfAccount){

selfAccount.onclick=()=>{

window.location.href="self-account.html";

};

}

// Fraud Alerts

const fraudAlerts=document.getElementById("fraudAlerts");

if(fraudAlerts){

fraudAlerts.onclick=()=>{

window.location.href="fraud-alerts.html";

};

}

// Risk Analysis

const riskAnalysis=document.getElementById("riskAnalysis");

if(riskAnalysis){

riskAnalysis.onclick=()=>{

window.location.href="risk-analysis.html";

};

}

// Customer Behaviour

const customerBehaviour=document.getElementById("customerBehaviour");

if(customerBehaviour){

customerBehaviour.onclick=()=>{

window.location.href="customer-behaviour.html";

};

}

// Check Balance

const checkBalance=document.getElementById("checkBalance");

if(checkBalance){

checkBalance.onclick=()=>{

window.location.href="check-balance.html";

};

}

const adminDashboard=document.getElementById("adminDashboard");

if(adminDashboard){

adminDashboard.onclick=()=>{

window.location.href="admin.html";

};

}

// Bottom Navigation

const bottomLinks=document.querySelectorAll(".bottom-nav a");

bottomLinks.forEach(link=>{

link.addEventListener("click",function(){

bottomLinks.forEach(nav=>{

nav.classList.remove("active");

});

this.classList.add("active");

});

});

if (window.AISecurePayAPI && window.AISecurePayAPI.loadDashboard) {
    window.AISecurePayAPI.loadDashboard();
}