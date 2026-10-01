// ==========================================
// AI SecurePay - Profile
// ==========================================

// ==========================================
// ELEMENTS
// ==========================================

const profilePhoto =
document.getElementById("profilePhoto");

const userName =
document.getElementById("userName");

const userEmail =
document.getElementById("userEmail");

const userPhone =
document.getElementById("userPhone");

const fullName =
document.getElementById("fullName");

const emailAddress =
document.getElementById("emailAddress");

const mobileNumber =
document.getElementById("mobileNumber");

const upiName =
document.getElementById("upiName");

const upiId =
document.getElementById("upiId");

const upiAddress =
document.getElementById("upiAddress");

const upiMobile =
document.getElementById("upiMobile");

const availableBalance =
document.getElementById("availableBalance");

const totalCredit =
document.getElementById("totalCredit");

const totalDebit =
document.getElementById("totalDebit");

const cashback =
document.getElementById("cashback");

const transactionCount =
document.getElementById("transactionCount");

const rewardPoints =
document.getElementById("rewardPoints");

const riskLevel =
document.getElementById("riskLevel");

// ==========================================
// LOAD PROFILE
// ==========================================

const savedAccount = JSON.parse(localStorage.getItem('securepayUser') || 'null');
let profile = savedAccount || JSON.parse(localStorage.getItem("userProfile") || 'null') || {

name:"Gnana Deepika",

email:"deepika@aisecurepay.com",

phone:"+91 9876543210",

upi:"deepika@aisecurepay",

photo:"https://i.pravatar.cc/200?img=12"

};

// ==========================================
// DISPLAY PROFILE
// ==========================================

userName.innerHTML=profile.name;

fullName.innerHTML=profile.name;

userEmail.innerHTML=profile.email;

emailAddress.innerHTML=profile.email;

userPhone.innerHTML=profile.phone;

mobileNumber.innerHTML=profile.phone;

upiName.innerHTML=profile.name;

upiId.innerHTML=profile.upi;

upiAddress.innerHTML=profile.upi;

upiMobile.innerHTML=profile.phone;

profilePhoto.src=profile.photo;

// ==========================================
// LOAD TRANSACTIONS
// ==========================================

let transactions=

JSON.parse(

localStorage.getItem("transactionHistory")

)||[];

// ==========================================
// LOAD BALANCE
// ==========================================

let balance=

Number(

localStorage.getItem("accountBalance")

)||50000;

// ==========================================
// UPDATE BALANCE
// ==========================================

availableBalance.innerHTML=

"₹"+balance.toLocaleString("en-IN");

// ==========================================
// INITIAL VALUES
// ==========================================

transactionCount.innerHTML=

transactions.length;

rewardPoints.innerHTML=

Math.floor(transactions.length*10);

cashback.innerHTML=

"₹"+Math.floor(transactions.length*5);
// ==========================================
// CALCULATE PAYMENT STATISTICS
// ==========================================

let credit=0;

let debit=0;

let success=0;

transactions.forEach(tx=>{

    const amount=

    Number(

        String(tx.amount)

        .replace(/[₹,]/g,"")

    )||0;

    if(tx.type==="Credit"){

        credit+=amount;

    }

    else if(tx.type==="Debit"){

        debit+=amount;

    }

    if(tx.status==="Success"){

        success++;

    }

});

// ==========================================
// UPDATE WALLET
// ==========================================

totalCredit.innerHTML=

"₹"+credit.toLocaleString("en-IN");

totalDebit.innerHTML=

"₹"+debit.toLocaleString("en-IN");

// ==========================================
// PAYMENT STATISTICS
// ==========================================

const totalTransactions=

document.getElementById("totalTransactions");

const successRate=

document.getElementById("successRate");

const moneySent=

document.getElementById("moneySent");

const moneyReceived=

document.getElementById("moneyReceived");

totalTransactions.innerHTML=

transactions.length;

moneySent.innerHTML=

"₹"+debit.toLocaleString("en-IN");

moneyReceived.innerHTML=

"₹"+credit.toLocaleString("en-IN");

let rate=100;

if(transactions.length>0){

    rate=Math.round(

        (success/transactions.length)*100

    );

}

successRate.innerHTML=

rate+"%";

// ==========================================
// AI SECURITY SCORE
// ==========================================

const aiScore=

document.getElementById("aiScore");

const riskStatus=

document.getElementById("riskStatus");

// Load saved risk score
let score=

Number(

localStorage.getItem("riskScore")

)||96;

aiScore.innerHTML=

score+"%";

// Risk Level

if(score>=90){

    riskStatus.innerHTML="Low Risk";

    riskLevel.innerHTML="Low";

}

else if(score>=70){

    riskStatus.innerHTML="Medium Risk";

    riskLevel.innerHTML="Medium";

}

else{

    riskStatus.innerHTML="High Risk";

    riskLevel.innerHTML="High";

}

// ==========================================
// SAVE UPDATED PROFILE STATS
// ==========================================

localStorage.setItem(

"profileStats",

JSON.stringify({

balance,

credit,

debit,

transactions:

transactions.length,

reward:

rewardPoints.innerHTML,

score

})

);
// ==========================================
// RECENT ACTIVITY
// ==========================================

const recentActivity=

document.getElementById("recentActivity");

loadRecentTransactions();

function loadRecentTransactions(){

    recentActivity.innerHTML="";

    if(transactions.length===0){

        recentActivity.innerHTML=`

        <div class="activity-item">

            <div class="activity-icon">

                <i class="fa-solid fa-wallet"></i>

            </div>

            <div class="activity-details">

                <h4>No Transactions</h4>

                <p>Your recent transactions will appear here.</p>

            </div>

        </div>

        `;

        return;

    }

    transactions.slice(0,5).forEach(tx=>{

        const amount=

        Number(

            String(tx.amount)

            .replace(/[₹,]/g,"")

        )||0;

        const color=

        tx.type==="Credit"

        ?

        "#22C55E"

        :

        "#EF4444";

        const icon=

        tx.type==="Credit"

        ?

        "fa-arrow-down"

        :

        "fa-arrow-up";

        recentActivity.innerHTML+=`

        <div class="activity-item">

            <div class="activity-icon">

                <i class="fa-solid ${icon}"></i>

            </div>

            <div class="activity-details">

                <h4>${tx.name||"Transaction"}</h4>

                <p>

                ${tx.date||""}

                </p>

            </div>

            <div

            class="activity-amount"

            style="color:${color};">

            ${tx.type==="Credit"

            ?

            "+"

            :

            "-"

            }

            ₹${amount.toLocaleString("en-IN")}

            </div>

        </div>

        `;

    });

}

// ==========================================
// VIEW ALL TRANSACTIONS
// ==========================================

document

.getElementById(

"viewAllTransactions"

)

.addEventListener("click",()=>{

    window.location.href=

    "transaction-history.html";

});

// ==========================================
// CHANGE PROFILE PHOTO
// ==========================================

document

.getElementById(

"changePhotoBtn"

)

.addEventListener("click",()=>{

    const url=

    prompt(

"Enter profile image URL"

    );

    if(url){

        profile.photo=url;

        profilePhoto.src=url;

        localStorage.setItem(

            "userProfile",

            JSON.stringify(profile)

        );

    }

});

// ==========================================
// EDIT PROFILE
// ==========================================

document

.getElementById(

"editProfileBtn"

)

.addEventListener("click",()=>{

    const newName=

    prompt(

    "Enter Name",

    profile.name

    );

    if(newName){

        profile.name=newName;

    }

    const newEmail=

    prompt(

    "Enter Email",

    profile.email

    );

    if(newEmail){

        profile.email=newEmail;

    }

    const newPhone=

    prompt(

    "Enter Mobile Number",

    profile.phone

    );

    if(newPhone){

        profile.phone=newPhone;

    }

    localStorage.setItem(

        "userProfile",

        JSON.stringify(profile)

    );

    location.reload();

});
// ==========================================
// QR CODE FUNCTIONS
// ==========================================

const qrImage =
document.getElementById("userQR");

const shareQRBtn =
document.getElementById("shareQRBtn");

const downloadQRBtn =
document.getElementById("downloadQRBtn");

const saveQRBtn =
document.getElementById("saveQRBtn");

const printQRBtn =
document.getElementById("printQRBtn");

// ==========================================
// SHARE QR
// ==========================================

shareQRBtn.addEventListener("click",async()=>{

    const shareData={

        title:"AI SecurePay UPI",

        text:

`Pay me using AI SecurePay

Name : ${profile.name}

UPI ID : ${profile.upi}`,

        url:qrImage.src

    };

    if(navigator.share){

        try{

            await navigator.share(shareData);

        }

        catch(err){

            console.log(err);

        }

    }

    else{

        navigator.clipboard.writeText(

profile.upi

        );

        alert(

"UPI ID copied to clipboard."

        );

    }

});

// ==========================================
// DOWNLOAD QR
// ==========================================

downloadQRBtn.addEventListener("click",()=>{

    const link=

    document.createElement("a");

    link.href=qrImage.src;

    link.download="AI-SecurePay-QR.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

});

// ==========================================
// SAVE QR
// ==========================================

saveQRBtn.addEventListener("click",()=>{

    const link=

    document.createElement("a");

    link.href=qrImage.src;

    link.download="My-UPI-QR.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    alert(

"QR saved successfully."

    );

});

// ==========================================
// PRINT QR
// ==========================================

printQRBtn.addEventListener("click",()=>{

    const win=

    window.open(

        "",

        "_blank"

    );

    win.document.write(`

    <html>

    <head>

    <title>

    AI SecurePay QR

    </title>

    </head>

    <body style="text-align:center;
    font-family:Poppins">

    <h2>

    ${profile.name}

    </h2>

    <img

    src="${qrImage.src}"

    width="260">

    <p>

    ${profile.upi}

    </p>

    </body>

    </html>

    `);

    win.document.close();

    win.print();

});

// ==========================================
// UPDATE QR IF PROFILE CHANGES
// ==========================================

function updateQRCode(){

    qrImage.src=

`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${profile.upi}&pn=${encodeURIComponent(profile.name)}`;

}

updateQRCode();
// ==========================================
// LOGOUT POPUP
// ==========================================

const logoutBtn =
document.getElementById("logoutBtn");

const logoutPopup =
document.getElementById("logoutPopup");

const cancelLogout =
document.getElementById("cancelLogout");

const confirmLogout =
document.getElementById("confirmLogout");

logoutBtn.addEventListener("click",()=>{

    logoutPopup.style.display="flex";

});

cancelLogout.addEventListener("click",()=>{

    logoutPopup.style.display="none";

});

confirmLogout.addEventListener("click",()=>{

    localStorage.removeItem("isLoggedIn");

    alert("Logged out successfully.");

    window.location.href="index.html";

});

// ==========================================
// PREFERENCES
// ==========================================

const preferenceSwitches=

document.querySelectorAll(

".preferences-card input[type='checkbox']"

);

preferenceSwitches.forEach((toggle,index)=>{

    const saved=

    localStorage.getItem(

    "preference_"+index

    );

    if(saved!==null){

        toggle.checked=

        saved==="true";

    }

    toggle.addEventListener("change",()=>{

        localStorage.setItem(

        "preference_"+index,

        toggle.checked

        );

    });

});

// ==========================================
// LANGUAGE
// ==========================================

const languageSelect=

document.getElementById(

"languageSelect"

);

const savedLanguage=

localStorage.getItem(

"language"

);

if(savedLanguage){

    languageSelect.value=

    savedLanguage;

}

languageSelect.addEventListener("change",()=>{

    localStorage.setItem(

    "language",

    languageSelect.value

    );

    alert(

    "Language changed to "

    +languageSelect.value

    );

});

// ==========================================
// HELP & SUPPORT
// ==========================================

document.getElementById(

"faqBtn"

).addEventListener("click",()=>{

    alert(

`Frequently Asked Questions

• How to change UPI PIN?

• How to report fraud?

• How to link a bank account?

• How to recover my account?`

    );

});

document.getElementById(

"contactBtn"

).addEventListener("click",()=>{

    alert(

`AI SecurePay Support

📞 1800-123-4567

📧 support@aisecurepay.com

Available 24×7`

    );

});

document.getElementById(

"reportFraudBtn"

).addEventListener("click",()=>{

    window.location.href=

    "fraud-alerts.html";

});

document.getElementById(

"privacyBtn"

).addEventListener("click",()=>{

    alert(

"Privacy Policy page will open."

    );

});

document.getElementById(

"termsBtn"

).addEventListener("click",()=>{

    alert(

"Terms & Conditions page will open."

    );

});

// ==========================================
// MANAGE BANK
// ==========================================

document.getElementById(

"manageBankBtn"

).addEventListener("click",()=>{

    alert(

"Manage Linked Bank Accounts"

    );

});

// ==========================================
// MANAGE DEVICES
// ==========================================

document.getElementById(

"manageDevicesBtn"

).addEventListener("click",()=>{

    alert(

"Manage Linked Devices"

    );

});

// ==========================================
// CHANGE PASSWORD
// ==========================================

document.getElementById(

"changePasswordBtn"

).addEventListener("click",()=>{

    alert(

"Change Password feature."

    );

});

// ==========================================
// CHANGE UPI PIN
// ==========================================

document.getElementById(

"changePinBtn"

).addEventListener("click",()=>{

    alert(

"Change UPI PIN feature."

    );

});

console.log("⚙️ Profile Settings Loaded");
// ==========================================
// BACK BUTTON
// ==========================================

const backBtn =
document.querySelector(".back-btn");

if(backBtn){

    backBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="dashboard.html";

    });

}

// ==========================================
// AUTO REFRESH PROFILE
// ==========================================

function refreshProfile(){

    profile=

    JSON.parse(

        localStorage.getItem("userProfile")

    ) || profile;

    userName.innerHTML=profile.name;

    fullName.innerHTML=profile.name;

    userEmail.innerHTML=profile.email;

    emailAddress.innerHTML=profile.email;

    userPhone.innerHTML=profile.phone;

    mobileNumber.innerHTML=profile.phone;

    upiName.innerHTML=profile.name;

    upiId.innerHTML=profile.upi;

    upiAddress.innerHTML=profile.upi;

    upiMobile.innerHTML=profile.phone;

    profilePhoto.src=profile.photo;

    updateQRCode();

}

// ==========================================
// AUTO UPDATE BALANCE
// ==========================================

function refreshBalance(){

    balance=

    Number(

        localStorage.getItem(

        "accountBalance"

        )

    )||50000;

    availableBalance.innerHTML=

    "₹"+balance.toLocaleString("en-IN");

}

refreshBalance();

// ==========================================
// AUTO UPDATE TRANSACTIONS
// ==========================================

function refreshTransactions(){

    transactions=

    JSON.parse(

        localStorage.getItem(

        "transactionHistory"

        )

    ) || [];

    loadRecentTransactions();

}

refreshTransactions();

// ==========================================
// LIVE SYNC
// ==========================================

window.addEventListener("storage",()=>{

    refreshProfile();

    refreshBalance();

    refreshTransactions();

});

// ==========================================
// AUTO REFRESH EVERY 5 SECONDS
// ==========================================

setInterval(()=>{

    refreshBalance();

    refreshTransactions();

},5000);

// ==========================================
// BUTTON CLICK EFFECT
// ==========================================

document.querySelectorAll("button").forEach(btn=>{

    btn.addEventListener("click",()=>{

        btn.style.transform="scale(.95)";

        setTimeout(()=>{

            btn.style.transform="scale(1)";

        },120);

    });

});

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load",()=>{

    const cards=document.querySelectorAll(

".profile-card,.qr-card,.bank-card,.wallet-card,.personal-card,.security-card,.ai-score-card,.statistics-card,.recent-card,.devices-card,.preferences-card,.support-card,.logout-card"

    );

    cards.forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform="translateY(20px)";

        setTimeout(()=>{

            card.style.transition=".5s ease";

            card.style.opacity="1";

            card.style.transform="translateY(0)";

        },index*80);

    });

});

// ==========================================
// REWARD LEVEL
// ==========================================

const reward=parseInt(

rewardPoints.innerHTML

);

if(reward>=1000){

    rewardPoints.innerHTML=

    reward+" 🏆";

}

else if(reward>=500){

    rewardPoints.innerHTML=

    reward+" 🥇";

}

else{

    rewardPoints.innerHTML=

    reward+" ⭐";

}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        logoutPopup.style.display="none";

    }

});

// ==========================================
// PAGE READY
// ==========================================

console.log("👤 AI SecurePay Profile Ready");

console.log("Dashboard Connected");

console.log("Transaction History Connected");

console.log("Risk Analysis Connected");

console.log("Notifications Connected");

console.log("Fraud Alerts Connected");

console.log("Wallet Connected");

// ==========================================
// END OF FILE
// ==========================================