// ==========================================
// AI SecurePay - Check Balance
// ==========================================

// ==========================================
// ELEMENTS
// ==========================================

const verifyBtn=document.getElementById("verifyBtn");

const upiPopup=document.getElementById("upiPopup");

const loadingPopup=document.getElementById("loadingPopup");

const verifyPin=document.getElementById("verifyPin");

const cancelPin=document.getElementById("cancelPin");

const upiPin=document.getElementById("upiPin");

const pinError=document.getElementById("pinError");

const balanceSection=document.getElementById("balanceSection");

const availableBalance=document.getElementById("availableBalance");

const toggleBalance=document.getElementById("toggleBalance");

const refreshBtn=document.getElementById("refreshBtn");

const bankName=document.getElementById("bankName");

const accountNumber=document.getElementById("accountNumber");
const accountUser=JSON.parse(localStorage.getItem('securepayUser') || '{}');
const profileName=accountUser.name || 'Demo User';

// ==========================================
// DEMO UPI PIN
// ==========================================

const DEMO_PIN="1234";

// ==========================================
// DEFAULT ACCOUNT BALANCE
// ==========================================

let currentBalance=

Number(

localStorage.getItem("accountBalance")

)||50000;

// ==========================================
// LOAD TRANSACTIONS
// ==========================================

const transactions=

JSON.parse(

localStorage.getItem("transactionHistory")

)||[];

// ==========================================
// CALCULATE BALANCE
// ==========================================

function calculateBalance(){

let balance=50000;

transactions.forEach(tx=>{

const amount=

Number(

String(tx.amount)

.replace(/[₹,]/g,"")

)||0;

if(

tx.type==="Debit"

){

balance-=amount;

}

else if(

tx.type==="Credit"

){

balance+=amount;

}

});

currentBalance=balance;

localStorage.setItem(

"accountBalance",

currentBalance

);

}

// Calculate when page opens

calculateBalance();
// ==========================================
// BANK DETAILS
// ==========================================

const banks={

    SBI:{

        name:"State Bank of India",

        account:"XXXX XXXX 4321",

        holder:profileName,

        ifsc:"SBIN0001234",

        branch:"Visakhapatnam Main Branch"

    },

    Axis:{

        name:"Axis Bank",

        account:"XXXX XXXX 5678",

        holder:profileName,

        ifsc:"UTIB0002456",

        branch:"Dwaraka Nagar Branch"

    },

    HDFC:{

        name:"HDFC Bank",

        account:"XXXX XXXX 2468",

        holder:profileName,

        ifsc:"HDFC0005678",

        branch:"MVP Colony Branch"

    }

};

// ==========================================
// CONTINUE BUTTON
// ==========================================

verifyBtn.addEventListener("click",()=>{

    upiPopup.classList.add("show");

    upiPin.value="";

    pinError.style.display="none";

    upiPin.focus();

});

// ==========================================
// CANCEL PIN
// ==========================================

cancelPin.addEventListener("click",()=>{

    upiPopup.classList.remove("show");

});

// ==========================================
// VERIFY UPI PIN
// ==========================================

verifyPin.addEventListener("click",()=>{

    if(upiPin.value!==DEMO_PIN){

        pinError.style.display="block";

        upiPin.value="";

        return;

    }

    pinError.style.display="none";

    upiPopup.classList.remove("show");

    loadingPopup.classList.add("show");

    setTimeout(()=>{

        loadingPopup.classList.remove("show");

        balanceSection.style.display="block";

        updateBalance();

        updateSelectedBank();

    },2000);

});

// ==========================================
// UPDATE BALANCE
// ==========================================

function updateBalance(){

    availableBalance.innerHTML=

    "₹"+currentBalance.toLocaleString("en-IN");

}

// ==========================================
// UPDATE BANK DETAILS
// ==========================================

function updateSelectedBank(){

    const selected=

    document.querySelector(

        'input[name="bank"]:checked'

    ).value;

    const bank=banks[selected];

    bankName.innerHTML=bank.name;

    accountNumber.innerHTML=bank.account;

    document.getElementById("holderName").innerHTML=bank.holder;

    document.getElementById("accountNo").innerHTML=bank.account;

    document.getElementById("ifscCode").innerHTML=bank.ifsc;

    document.getElementById("branchName").innerHTML=bank.branch;

}

// ==========================================
// BANK CHANGE
// ==========================================

document.querySelectorAll(

'input[name="bank"]'

).forEach(bank=>{

    bank.addEventListener("change",()=>{

        updateSelectedBank();

    });

});
// ==========================================
// SHOW / HIDE BALANCE
// ==========================================

let balanceVisible=true;

toggleBalance.addEventListener("click",()=>{

    balanceVisible=!balanceVisible;

    if(balanceVisible){

        availableBalance.innerHTML=

        "₹"+currentBalance.toLocaleString("en-IN");

        toggleBalance.innerHTML=

        '<i class="fa-solid fa-eye"></i>';

    }

    else{

        availableBalance.innerHTML="••••••••";

        toggleBalance.innerHTML=

        '<i class="fa-solid fa-eye-slash"></i>';

    }

});

// ==========================================
// REFRESH BALANCE
// ==========================================

refreshBtn.addEventListener("click",()=>{

    calculateBalance();

    updateBalance();

    document.getElementById("lastUpdated").innerHTML=

    "Last Updated : "+

    new Date().toLocaleTimeString();

    refreshBtn.innerHTML=

    '<i class="fa-solid fa-check"></i> Refreshed';

    setTimeout(()=>{

        refreshBtn.innerHTML=

        '<i class="fa-solid fa-rotate-right"></i> Refresh Balance';

    },1500);

});

// ==========================================
// COPY ACCOUNT DETAILS
// ==========================================

const copyButtons=

document.querySelectorAll(".copy-btn");

copyButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const id=

        button.getAttribute("data-copy");

        const text=

        document.getElementById(id).innerText;

        navigator.clipboard.writeText(text);

        button.innerHTML=

        '<i class="fa-solid fa-check"></i>';

        setTimeout(()=>{

            button.innerHTML=

            '<i class="fa-regular fa-copy"></i>';

        },1500);

    });

});

// ==========================================
// ENABLE BALANCE ALERTS
// ==========================================

const enableAlertBtn=

document.getElementById("enableAlertBtn");

enableAlertBtn.addEventListener("click",()=>{

    alert(

`Balance Alerts Enabled

✓ Low Balance Alerts

✓ Credit Alerts

✓ Debit Alerts

✓ Large Transaction Alerts

AI SecurePay will notify you instantly.`

    );

});
// ==========================================
// AUTO UPDATE BALANCE
// ==========================================

function refreshAccountBalance(){

    const history =

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    let balance = 50000;

    history.forEach(tx=>{

        const amount =

        Number(

            String(tx.amount)

            .replace(/[₹,]/g,"")

        ) || 0;

        if(tx.type==="Credit"){

            balance += amount;

        }

        else if(tx.type==="Debit"){

            balance -= amount;

        }

    });

    currentBalance = balance;

    localStorage.setItem(

        "accountBalance",

        currentBalance

    );

    if(balanceVisible){

        availableBalance.innerHTML =

        "₹"+currentBalance.toLocaleString("en-IN");

    }

}

// ==========================================
// LAST UPDATED
// ==========================================

function updateLastUpdated(){

    document.getElementById("lastUpdated").innerHTML=

    "Last Updated : "+

    new Date().toLocaleString();

}

updateLastUpdated();

// ==========================================
// REFRESH BUTTON
// ==========================================

refreshBtn.addEventListener("click",()=>{

    refreshAccountBalance();

    updateLastUpdated();

});

// ==========================================
// AUTO REFRESH WHEN TRANSACTIONS CHANGE
// ==========================================

window.addEventListener("storage",()=>{

    refreshAccountBalance();

    updateLastUpdated();

});

// ==========================================
// AUTO REFRESH EVERY 5 SECONDS
// ==========================================

setInterval(()=>{

    refreshAccountBalance();

},5000);

// ==========================================
// BALANCE STATUS
// ==========================================

const balanceStatus=document.createElement("div");

balanceStatus.className="balance-status";

balanceSection.appendChild(balanceStatus);

function updateBalanceStatus(){

    if(currentBalance>=50000){

        balanceStatus.innerHTML=

        "🟢 Excellent Balance";

        balanceStatus.style.color="#22C55E";

    }

    else if(currentBalance>=10000){

        balanceStatus.innerHTML=

        "🟡 Average Balance";

        balanceStatus.style.color="#F59E0B";

    }

    else{

        balanceStatus.innerHTML=

        "🔴 Low Balance";

        balanceStatus.style.color="#EF4444";

    }

}

updateBalanceStatus();

// ==========================================
// UPDATE STATUS AFTER EVERY REFRESH
// ==========================================

setInterval(()=>{

    updateBalanceStatus();

},3000);
// ==========================================
// LOW BALANCE WARNING
// ==========================================

function checkLowBalance(){

    if(currentBalance<5000){

        setTimeout(()=>{

            alert(

`⚠ Low Balance Alert

Your available balance is

₹${currentBalance.toLocaleString("en-IN")}

Please maintain sufficient balance.`

            );

        },1000);

    }

}

checkLowBalance();

// ==========================================
// TRANSACTION SUMMARY
// ==========================================

function transactionSummary(){

    const history=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    let totalCredit=0;

    let totalDebit=0;

    history.forEach(tx=>{

        const amount=

        Number(

            String(tx.amount)

            .replace(/[₹,]/g,"")

        ) || 0;

        if(tx.type==="Credit"){

            totalCredit+=amount;

        }

        else if(tx.type==="Debit"){

            totalDebit+=amount;

        }

    });

    console.log("Total Credit :",totalCredit);

    console.log("Total Debit :",totalDebit);

    console.log("Current Balance :",currentBalance);

}

transactionSummary();

// ==========================================
// LARGE CREDIT NOTIFICATION
// ==========================================

function checkLargeCredit(){

    const history=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    if(history.length===0){

        return;

    }

    const latest=history[0];

    const amount=

    Number(

        String(latest.amount)

        .replace(/[₹,]/g,"")

    ) || 0;

    if(

        latest.type==="Credit"

        &&

        amount>=10000

    ){

        alert(

`💰 Large Credit Received

Amount :

₹${amount.toLocaleString("en-IN")}

Sender :

${latest.name}`

        );

    }

}

checkLargeCredit();

// ==========================================
// BANK CHANGE
// ==========================================

document.querySelectorAll(

'input[name="bank"]'

).forEach(bank=>{

    bank.addEventListener("change",()=>{

        updateSelectedBank();

        refreshAccountBalance();

        updateBalance();

        updateLastUpdated();

    });

});

// ==========================================
// PAGE READY
// ==========================================

console.log("AI SecurePay Check Balance Loaded");

// ==========================================
// END OF PART 5
// ==========================================
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

    // Enter → Verify UPI PIN

    if(e.key==="Enter"){

        if(upiPopup.classList.contains("show")){

            verifyPin.click();

        }

    }

    // Escape → Close Popup

    if(e.key==="Escape"){

        upiPopup.classList.remove("show");

        loadingPopup.classList.remove("show");

    }

});

// ==========================================
// BUTTON CLICK EFFECT
// ==========================================

document.querySelectorAll("button").forEach(button=>{

    button.addEventListener("click",()=>{

        button.style.transform="scale(.95)";

        setTimeout(()=>{

            button.style.transform="scale(1)";

        },120);

    });

});

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load",()=>{

    const container=document.querySelector(".container");

    container.style.opacity="0";

    container.style.transform="translateY(20px)";

    setTimeout(()=>{

        container.style.transition=".5s ease";

        container.style.opacity="1";

        container.style.transform="translateY(0)";

    },200);

});

// ==========================================
// AUTO SYNC WITH TRANSACTION HISTORY
// ==========================================

setInterval(()=>{

    refreshAccountBalance();

    updateBalanceStatus();

},10000);

// ==========================================
// AUTO SYNC ACROSS TABS
// ==========================================

window.addEventListener("storage",()=>{

    refreshAccountBalance();

    updateBalanceStatus();

    updateLastUpdated();

});

// ==========================================
// DEMO MESSAGE
// ==========================================

console.log(

"🏦 AI SecurePay Check Balance Ready"

);

console.log(

"Demo UPI PIN : 1234"

);

// ==========================================
// END OF FILE
// ==========================================