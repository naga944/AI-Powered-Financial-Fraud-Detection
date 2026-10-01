// ==========================================
// AI SecurePay Search
// ==========================================

// ==========================================
// ELEMENTS
// ==========================================

const searchInput =
document.getElementById("searchInput");

const clearSearch =
document.getElementById("clearSearch");

const recentSearchList =
document.getElementById("recentSearchList");

const searchResults =
document.getElementById("searchResults");

const transactionList =
document.getElementById("transactionList");

const notificationList =
document.getElementById("notificationList");

const fraudList =
document.getElementById("fraudList");

const searchCount =
document.getElementById("searchCount");

const peopleCount =
document.getElementById("peopleCount");

const transactionCount =
document.getElementById("transactionCount");

// ==========================================
// LOAD DATA
// ==========================================

let transactions =
JSON.parse(
localStorage.getItem("transactionHistory")
) || [];

let notifications =
JSON.parse(
localStorage.getItem("notifications")
) || [];

let fraudAlerts =
JSON.parse(
localStorage.getItem("fraudAlerts")
) || [];

let contacts =
JSON.parse(
localStorage.getItem("contacts")
) || [

{
name:"Rahul Kumar",
phone:"9876543210",
upi:"rahul@upi"
},

{
name:"Priya Sharma",
phone:"8765432109",
upi:"priya@upi"
},

{
name:"Anil Kumar",
phone:"9988776655",
upi:"anil@upi"
}

];

// ==========================================
// RECENT SEARCHES
// ==========================================

let recentSearches =
JSON.parse(
localStorage.getItem("recentSearches")
) || [];

// ==========================================
// SEARCH STATISTICS
// ==========================================

searchCount.innerHTML =
recentSearches.length;

peopleCount.innerHTML =
contacts.length;

transactionCount.innerHTML =
transactions.length;

// ==========================================
// DISPLAY RECENT SEARCHES
// ==========================================

displayRecentSearches();

function displayRecentSearches(){

    recentSearchList.innerHTML="";

    if(recentSearches.length===0){

        recentSearchList.innerHTML=`

        <div class="recent-item">

            <div class="recent-left">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <div>

                    <h4>No Recent Searches</h4>

                    <p>Start searching to see history.</p>

                </div>

            </div>

        </div>

        `;

        return;

    }

    recentSearches.forEach(item=>{

        recentSearchList.innerHTML+=`

        <div class="recent-item">

            <div class="recent-left">

                <i class="fa-solid fa-magnifying-glass"></i>

                <div>

                    <h4>${item}</h4>

                    <p>Recent Search</p>

                </div>

            </div>

        </div>

        `;

    });

}
// ==========================================
// LIVE SEARCH
// ==========================================

searchInput.addEventListener("input",()=>{

    const keyword=

    searchInput.value

    .trim()

    .toLowerCase();

    searchResults.innerHTML="";

    if(keyword===""){

        return;

    }

    // Save recent search

    if(!recentSearches.includes(searchInput.value.trim())){

        recentSearches.unshift(

            searchInput.value.trim()

        );

        recentSearches=

        recentSearches.slice(0,10);

        localStorage.setItem(

            "recentSearches",

            JSON.stringify(recentSearches)

        );

        displayRecentSearches();

    }

    searchPeople(keyword);

    searchBanks(keyword);

    searchTransactions(keyword);

    searchNotifications(keyword);

    searchFraudAlerts(keyword);

});

// ==========================================
// SEARCH PEOPLE
// ==========================================

function searchPeople(keyword){

    contacts.forEach(person=>{

        if(

            person.name.toLowerCase().includes(keyword)

            ||

            person.phone.includes(keyword)

            ||

            person.upi.toLowerCase().includes(keyword)

        ){

            searchResults.innerHTML+=`

            <div class="result-card">

                <div class="result-icon">

                    <i class="fa-solid fa-user"></i>

                </div>

                <div class="result-details">

                    <h3>${person.name}</h3>

                    <p>${person.phone}</p>

                    <p>${person.upi}</p>

                </div>

            </div>

            `;

        }

    });

}

// ==========================================
// SEARCH BANKS
// ==========================================

function searchBanks(keyword){

    const banks=[

        {

        name:"State Bank of India",

        account:"XXXX4321"

        },

        {

        name:"HDFC Bank",

        account:"XXXX6743"

        }

    ];

    banks.forEach(bank=>{

        if(

        bank.name

        .toLowerCase()

        .includes(keyword)

        ){

            searchResults.innerHTML+=`

            <div class="result-card">

                <div class="result-icon">

                    <i class="fa-solid fa-building-columns"></i>

                </div>

                <div class="result-details">

                    <h3>${bank.name}</h3>

                    <p>${bank.account}</p>

                </div>

            </div>

            `;

        }

    });

}
// ==========================================
// SEARCH TRANSACTIONS
// ==========================================

function searchTransactions(keyword){

    transactions.forEach(tx=>{

        const name=(tx.name||"").toLowerCase();

        const amount=String(tx.amount||"");

        const type=(tx.type||"").toLowerCase();

        const date=(tx.date||"").toLowerCase();

        if(

            name.includes(keyword) ||

            amount.includes(keyword) ||

            type.includes(keyword) ||

            date.includes(keyword)

        ){

            searchResults.innerHTML+=`

            <div class="result-card">

                <div class="result-icon">

                    <i class="fa-solid fa-money-bill-transfer"></i>

                </div>

                <div class="result-details">

                    <h3>${tx.name||"Transaction"}</h3>

                    <p>

                    ${tx.type||""} • ₹${tx.amount||0}

                    </p>

                    <p>

                    ${tx.date||""}

                    </p>

                </div>

            </div>

            `;

        }

    });

}

// ==========================================
// SEARCH NOTIFICATIONS
// ==========================================

function searchNotifications(keyword){

    notifications.forEach(note=>{

        const title=(note.title||"").toLowerCase();

        const message=(note.message||"").toLowerCase();

        if(

            title.includes(keyword) ||

            message.includes(keyword)

        ){

            searchResults.innerHTML+=`

            <div class="result-card">

                <div class="result-icon">

                    <i class="fa-regular fa-bell"></i>

                </div>

                <div class="result-details">

                    <h3>${note.title}</h3>

                    <p>${note.message}</p>

                </div>

            </div>

            `;

        }

    });

}

// ==========================================
// SEARCH FRAUD ALERTS
// ==========================================

function searchFraudAlerts(keyword){

    fraudAlerts.forEach(alert=>{

        const title=(alert.title||"Fraud Alert").toLowerCase();

        const reason=(alert.reason||alert.message||"").toLowerCase();

        if(

            title.includes(keyword) ||

            reason.includes(keyword)

        ){

            searchResults.innerHTML+=`

            <div class="result-card">

                <div class="result-icon">

                    <i class="fa-solid fa-shield-halved"></i>

                </div>

                <div class="result-details">

                    <h3>${alert.title||"Fraud Alert"}</h3>

                    <p>

                    ${alert.reason||alert.message||""}

                    </p>

                </div>

            </div>

            `;

        }

    });

}

// ==========================================
// NO RESULTS FOUND
// ==========================================

function checkNoResults(){

    if(

        searchResults.innerHTML.trim()===""

    ){

        searchResults.innerHTML=`

        <div class="result-card">

            <div class="result-icon">

                <i class="fa-solid fa-circle-info"></i>

            </div>

            <div class="result-details">

                <h3>No Results Found</h3>

                <p>

                Try searching with another keyword.

                </p>

            </div>

        </div>

        `;

    }

}

searchInput.addEventListener("input",()=>{

    setTimeout(checkNoResults,100);

});
// ==========================================
// LOAD RECENT TRANSACTIONS
// ==========================================

loadTransactions();

function loadTransactions(){

    transactionList.innerHTML="";

    if(transactions.length===0){

        transactionList.innerHTML=`

        <div class="transaction-card">

            <div class="transaction-left">

                <i class="fa-solid fa-wallet"></i>

                <div>

                    <h4>No Transactions</h4>

                    <p>No recent transactions found.</p>

                </div>

            </div>

        </div>

        `;

        return;

    }

    transactions.slice(0,5).forEach(tx=>{

        transactionList.innerHTML+=`

        <div class="transaction-card">

            <div class="transaction-left">

                <i class="fa-solid fa-money-bill-transfer"></i>

                <div>

                    <h4>${tx.name||"Transaction"}</h4>

                    <p>${tx.date||""}</p>

                </div>

            </div>

            <div class="transaction-amount">

                ₹${tx.amount||0}

            </div>

        </div>

        `;

    });

}

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

loadNotifications();

function loadNotifications(){

    notificationList.innerHTML="";

    if(notifications.length===0){

        notificationList.innerHTML=`

        <div class="notification-card">

            <i class="fa-regular fa-bell"></i>

            <div class="result-details">

                <h3>No Notifications</h3>

                <p>You don't have any notifications.</p>

            </div>

        </div>

        `;

        return;

    }

    notifications.slice(0,5).forEach(note=>{

        notificationList.innerHTML+=`

        <div class="notification-card">

            <i class="fa-solid ${note.icon}"></i>

            <div class="result-details">

                <h3>${note.title}</h3>

                <p>${note.message}</p>

            </div>

        </div>

        `;

    });

}

// ==========================================
// LOAD FRAUD ALERTS
// ==========================================

loadFraudAlerts();

function loadFraudAlerts(){

    fraudList.innerHTML="";

    if(fraudAlerts.length===0){

        fraudList.innerHTML=`

        <div class="fraud-card">

            <i class="fa-solid fa-shield-halved"></i>

            <div>

                <h4>No Fraud Alerts</h4>

                <p>Your account is secure.</p>

            </div>

        </div>

        `;

        return;

    }

    fraudAlerts.slice(0,5).forEach(alert=>{

        fraudList.innerHTML+=`

        <div class="fraud-card">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <div>

                <h4>${alert.title||"Fraud Alert"}</h4>

                <p>${alert.reason||alert.message||""}</p>

            </div>

        </div>

        `;

    });

}

// ==========================================
// UPDATE SEARCH STATISTICS
// ==========================================

function updateStatistics(){

    searchCount.innerHTML=

    recentSearches.length;

    peopleCount.innerHTML=

    contacts.length;

    transactionCount.innerHTML=

    transactions.length;

}

updateStatistics();

// ==========================================
// AUTO REFRESH DATA
// ==========================================

window.addEventListener("storage",()=>{

    transactions=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    )||[];

    notifications=

    JSON.parse(

        localStorage.getItem("notifications")

    )||[];

    fraudAlerts=

    JSON.parse(

        localStorage.getItem("fraudAlerts")

    )||[];

    loadTransactions();

    loadNotifications();

    loadFraudAlerts();

    updateStatistics();

});
// ==========================================
// CLEAR SEARCH
// ==========================================

clearSearch.addEventListener("click",()=>{

    searchInput.value="";

    searchResults.innerHTML="";

    searchInput.focus();

});

// ==========================================
// CLEAR SEARCH HISTORY
// ==========================================

const clearHistory=
document.getElementById("clearHistory");

clearHistory.addEventListener("click",()=>{

    if(confirm("Clear all recent searches?")){

        recentSearches=[];

        localStorage.removeItem(

            "recentSearches"

        );

        displayRecentSearches();

        updateStatistics();

    }

});

// ==========================================
// CONTACT SUPPORT
// ==========================================

document.getElementById(

"contactSupport"

).addEventListener("click",()=>{

    alert(

`AI SecurePay Support

📞 1800-123-4567

📧 support@aisecurepay.com

Available 24 × 7`

    );

});

// ==========================================
// REPORT ISSUE
// ==========================================

document.getElementById(

"reportIssue"

).addEventListener("click",()=>{

    const issue=

    prompt(

"Describe your issue"

    );

    if(issue){

        let reports=

        JSON.parse(

        localStorage.getItem(

        "reportedIssues"

        )

        ) || [];

        reports.unshift({

            issue:issue,

            date:new Date()

            .toLocaleString()

        });

        localStorage.setItem(

        "reportedIssues",

        JSON.stringify(reports)

        );

        alert(

"Issue submitted successfully."

        );

    }

});

// ==========================================
// PAY BUTTONS
// ==========================================

document.querySelectorAll(

".pay-btn"

).forEach(btn=>{

    btn.addEventListener("click",(e)=>{

        const card=

        e.target.closest(

        ".person-card"

        );

        const name=

        card.querySelector(

        "h3"

        ).innerHTML;

        localStorage.setItem(

        "receiverName",

        name

        );

        window.location.href=

        "payment.html";

    });

});

// ==========================================
// BUTTON CLICK EFFECT
// ==========================================

document.querySelectorAll(

"button"

).forEach(btn=>{

    btn.addEventListener("click",()=>{

        btn.style.transform=

        "scale(.95)";

        setTimeout(()=>{

            btn.style.transform=

            "scale(1)";

        },120);

    });

});

// ==========================================
// PAGE READY
// ==========================================

console.log(

"🔍 AI SecurePay Search Ready"

);
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
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown",(e)=>{

    // Ctrl + F → Focus Search

    if(e.ctrlKey && e.key==="f"){

        e.preventDefault();

        searchInput.focus();

        searchInput.select();

    }

    // ESC → Clear Search

    if(e.key==="Escape"){

        searchInput.value="";

        searchResults.innerHTML="";

    }

});

// ==========================================
// AUTO REFRESH
// ==========================================

function refreshData(){

    transactions=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    notifications=

    JSON.parse(

        localStorage.getItem("notifications")

    ) || [];

    fraudAlerts=

    JSON.parse(

        localStorage.getItem("fraudAlerts")

    ) || [];

    recentSearches=

    JSON.parse(

        localStorage.getItem("recentSearches")

    ) || [];

    loadTransactions();

    loadNotifications();

    loadFraudAlerts();

    displayRecentSearches();

    updateStatistics();

}

setInterval(refreshData,5000);

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load",()=>{

    const cards=

    document.querySelectorAll(

".recent-searches,.people-section,.bank-section,.services-section,.results-section,.transactions-section,.notifications-section,.fraud-section,.ai-section,.quick-access,.statistics-section,.support-section"

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
// STORAGE SYNC
// ==========================================

window.addEventListener("storage",()=>{

    refreshData();

});

// ==========================================
// SEARCH ON ENTER
// ==========================================

searchInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        searchInput.blur();

    }

});

// ==========================================
// QUICK SEARCH FUNCTION
// ==========================================

function quickSearch(text){

    searchInput.value=text;

    searchInput.dispatchEvent(

        new Event("input")

    );

}

// ==========================================
// PAGE READY
// ==========================================

console.log("🔍 AI SecurePay Search Page Ready");

console.log("✅ Dashboard Connected");

console.log("✅ Profile Connected");

console.log("✅ Transactions Connected");

console.log("✅ Notifications Connected");

console.log("✅ Fraud Alerts Connected");

console.log("✅ Check Balance Connected");

// ==========================================
// END OF FILE
// ==========================================