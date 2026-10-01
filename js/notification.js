// ==========================================
// AI SecurePay - Notification Center
// ==========================================

// ==========================================
// ELEMENTS
// ==========================================

const notificationContainer =
document.getElementById("notificationContainer");

const emptyNotification =
document.getElementById("emptyNotification");

const searchNotification =
document.getElementById("searchNotification");

const totalNotifications =
document.getElementById("totalNotifications");

const unreadNotifications =
document.getElementById("unreadNotifications");

const securityNotifications =
document.getElementById("securityNotifications");

const notificationCount =
document.getElementById("notificationCount");

const scanTime =
document.getElementById("scanTime");

// ==========================================
// LOAD NOTIFICATIONS
// ==========================================

let notifications =

JSON.parse(

localStorage.getItem("notifications")

) || [];

notifications = notifications.filter((notification) => ![
    '₹2,500 sent successfully to Rahul.',
    'AI blocked a suspicious transaction.',
    'Your account balance has been refreshed.'
].includes(notification.message));
localStorage.setItem('notifications', JSON.stringify(notifications));

// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary(){

    totalNotifications.innerHTML=

    notifications.length;

    let unread=0;

    let security=0;

    notifications.forEach(item=>{

        if(!item.read){

            unread++;

        }

        if(item.category==="security"){

            security++;

        }

    });

    unreadNotifications.innerHTML=unread;

    securityNotifications.innerHTML=security;

    notificationCount.innerHTML=

    notifications.length+" Notifications";

}

updateSummary();

// ==========================================
// UPDATE AI SCAN TIME
// ==========================================

scanTime.innerHTML=

new Date().toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

});
// ==========================================
// DISPLAY NOTIFICATIONS
// ==========================================

displayNotifications(notifications);

function displayNotifications(data){

    notificationContainer.innerHTML="";

    if(data.length===0){

        emptyNotification.style.display="block";

        notificationContainer.style.display="none";

        return;

    }

    emptyNotification.style.display="none";

    notificationContainer.style.display="block";

    data.forEach((item,index)=>{

        let iconClass="system";

        if(item.category==="payment"){

            iconClass="payment";

        }

        else if(item.category==="security"){

            iconClass="security";

        }

        else if(item.category==="warning"){

            iconClass="warning";

        }

        const card=document.createElement("div");

        card.className="notification-card";

        card.innerHTML=`

        <div class="notification-icon ${iconClass}">

            <i class="fa-solid ${item.icon}"></i>

        </div>

        <div class="notification-content">

            <h3>${item.title}</h3>

            <p>${item.message}</p>

            <small class="notification-time">

                ${item.date} • ${item.time}

            </small>

            <br>

            <span class="notification-status

            ${item.read ? 'status-read':'status-unread'}">

                ${item.read ? 'Read':'Unread'}

            </span>

        </div>

        <div class="notification-actions">

            <button

            class="read-btn"

            onclick="markAsRead(${index})"

            title="Mark as Read">

            <i class="fa-solid fa-check"></i>

            </button>

            <button

            class="delete-btn"

            onclick="deleteNotification(${index})"

            title="Delete">

            <i class="fa-solid fa-trash"></i>

            </button>

        </div>

        `;

        notificationContainer.appendChild(card);

    });

}
// ==========================================
// SEARCH NOTIFICATIONS
// ==========================================

searchNotification.addEventListener("keyup",()=>{

    const keyword=

    searchNotification.value.toLowerCase();

    const filtered=

    notifications.filter(item=>{

        return(

            (item.title||"").toLowerCase().includes(keyword)||

            (item.message||"").toLowerCase().includes(keyword)||

            (item.category||"").toLowerCase().includes(keyword)

        );

    });

    displayNotifications(filtered);

});

// ==========================================
// FILTER BUTTONS
// ==========================================

const filterButtons=

document.querySelectorAll(".filter-btn");

filterButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        filterButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

        const filter=

        button.dataset.filter;

        if(filter==="all"){

            displayNotifications(notifications);

            return;

        }

        const filtered=

        notifications.filter(item=>

            item.category===filter

        );

        displayNotifications(filtered);

    });

});

// ==========================================
// REFRESH NOTIFICATIONS
// ==========================================

function refreshNotifications(){

    notifications=

    JSON.parse(

        localStorage.getItem("notifications")

    ) || [];

    updateSummary();

    displayNotifications(notifications);

}

// ==========================================
// AUTO REFRESH
// ==========================================

window.addEventListener("storage",()=>{

    refreshNotifications();

});

// ==========================================
// UPDATE RECENT ACTIVITY
// ==========================================

const transactionSummary=

document.getElementById("transactionSummary");

const fraudSummary=

document.getElementById("fraudSummary");

function updateActivity(){

    const history=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    const frauds=

    JSON.parse(

        localStorage.getItem("fraudAlerts")

    ) || [];

    if(history.length>0){

        transactionSummary.innerHTML=

        `${history.length} Recent Transactions`;

    }

    else{

        transactionSummary.innerHTML=

        "No Recent Transactions";

    }

    if(frauds.length>0){

        fraudSummary.innerHTML=

        `${frauds.length} Security Alerts`;

    }

    else{

        fraudSummary.innerHTML=

        "AI Monitoring Active";

    }

}

updateActivity();
// ==========================================
// MARK AS READ
// ==========================================

function markAsRead(index){

    notifications[index].read=true;

    localStorage.setItem(

        "notifications",

        JSON.stringify(notifications)

    );

    refreshNotifications();

}

// ==========================================
// DELETE NOTIFICATION
// ==========================================

function deleteNotification(index){

    if(confirm("Delete this notification?")){

        notifications.splice(index,1);

        localStorage.setItem(

            "notifications",

            JSON.stringify(notifications)

        );

        refreshNotifications();

    }

}

// ==========================================
// CLEAR ALL NOTIFICATIONS
// ==========================================

const clearBtn=

document.getElementById("clearBtn");

const clearAllBtn=

document.getElementById("clearAllBtn");

function clearNotifications(){

    if(confirm("Delete all notifications?")){

        notifications=[];

        localStorage.setItem(

            "notifications",

            JSON.stringify(notifications)

        );

        refreshNotifications();

    }

}

clearBtn.addEventListener("click",clearNotifications);

clearAllBtn.addEventListener("click",clearNotifications);

// ==========================================
// SAVE NOTIFICATIONS
// ==========================================

function saveNotifications(){

    localStorage.setItem(

        "notifications",

        JSON.stringify(notifications)

    );

}

// ==========================================
// STORAGE SYNC
// ==========================================

window.addEventListener("storage",()=>{

    refreshNotifications();

    updateActivity();

});

// ==========================================
// INITIAL LOAD
// ==========================================

refreshNotifications();
// ==========================================
// CONTACT SUPPORT
// ==========================================

const supportBtn=

document.getElementById("supportBtn");

supportBtn.addEventListener("click",()=>{

    alert(

`AI SecurePay Support

Customer Care : 1800-123-4567

Email : support@aisecurepay.com

Support Available 24 × 7`

    );

});

// ==========================================
// CREATE NOTIFICATION
// ==========================================

function addNotification(

title,

message,

category,

icon,

type

){

    let notifications=

    JSON.parse(

        localStorage.getItem("notifications")

    ) || [];

    notifications.unshift({

        id:Date.now(),

        title:title,

        message:message,

        category:category,

        icon:icon,

        type:type,

        read:false,

        date:new Date().toLocaleDateString(),

        time:new Date().toLocaleTimeString()

    });

    localStorage.setItem(

        "notifications",

        JSON.stringify(notifications)

    );

    refreshNotifications();

}

// ==========================================
// AUTO NOTIFICATION FROM FRAUD ALERTS
// ==========================================

const fraudAlerts=

JSON.parse(

localStorage.getItem("fraudAlerts")

) || [];

if(

fraudAlerts.length>0

){

    const latest=

    fraudAlerts[0];

    if(

        !sessionStorage.getItem(

            "fraudNotification"

        )

    ){

        addNotification(

            "Fraud Alert",

            latest.reason,

            "security",

            "fa-shield-halved",

            "danger"

        );

        sessionStorage.setItem(

            "fraudNotification",

            "true"

        );

    }

}

// ==========================================
// AUTO NOTIFICATION FROM TRANSACTIONS
// ==========================================

const history=

JSON.parse(

localStorage.getItem("transactionHistory")

) || [];

if(

history.length>0

){

    const latest=

    history[0];

    if(

        !sessionStorage.getItem(

            "paymentNotification"

        )

    ){

        addNotification(

            latest.type==="Credit"

            ?

            "Money Received"

            :

            "Payment Successful",

            `${latest.amount} ${

                latest.type==="Credit"

                ?

                "credited"

                :

                "paid"

            }`,

            "payment",

            "fa-money-bill-transfer",

            "success"

        );

        sessionStorage.setItem(

            "paymentNotification",

            "true"

        );

    }

}

// ==========================================
// LOW BALANCE NOTIFICATION
// ==========================================

const balance=

Number(

localStorage.getItem(

"accountBalance"

)

)||50000;

if(

balance<5000

){

    if(

        !sessionStorage.getItem(

            "lowBalance"

        )

    ){

        addNotification(

            "Low Balance",

            `Current Balance : ₹${balance.toLocaleString("en-IN")}`,

            "system",

            "fa-wallet",

            "warning"

        );

        sessionStorage.setItem(

            "lowBalance",

            "true"

        );

    }

}

// ==========================================
// LIVE AI SCAN
// ==========================================

function updateScanTime(){

    scanTime.innerHTML=

    new Date().toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit",

        second:"2-digit"

    });

}

updateScanTime();

setInterval(updateScanTime,1000);

// ==========================================
// AUTO REFRESH
// ==========================================

setInterval(()=>{

    refreshNotifications();

    updateActivity();

},5000);

// ==========================================
// PAGE ANIMATION
// ==========================================

window.addEventListener("load",()=>{

    const cards=

    document.querySelectorAll(

        ".notification-card,.summary-card,.security-card,.activity-card,.recommendation-card"

    );

    cards.forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform="translateY(20px)";

        setTimeout(()=>{

            card.style.transition=".5s ease";

            card.style.opacity="1";

            card.style.transform="translateY(0)";

        },index*100);

    });

});

console.log("🔔 Notification Center Connected");
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

    // Ctrl + F → Search Notifications

    if(e.ctrlKey && e.key==="f"){

        e.preventDefault();

        searchNotification.focus();

    }

    // ESC → Clear Search

    if(e.key==="Escape"){

        searchNotification.value="";

        displayNotifications(notifications);

    }

});

// ==========================================
// EXPORT NOTIFICATIONS
// ==========================================

function exportNotifications(){

    const blob=new Blob(

        [

            JSON.stringify(

                notifications,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );

    const url=

    URL.createObjectURL(blob);

    const link=

    document.createElement("a");

    link.href=url;

    link.download="notifications.json";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}

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
// PAGE LOAD EFFECT
// ==========================================

window.addEventListener("load",()=>{

    const container=document.querySelector(".container");

    container.style.opacity="0";

    container.style.transform="translateY(20px)";

    setTimeout(()=>{

        container.style.transition=".5s ease";

        container.style.opacity="1";

        container.style.transform="translateY(0)";

    },150);

});

// ==========================================
// FINAL AUTO SYNC
// ==========================================

window.addEventListener("storage",()=>{

    refreshNotifications();

    updateSummary();

    updateActivity();

});

// ==========================================
// DEMO FUNCTION
// ==========================================

// Open Browser Console and run:
// addDemoNotification();

// ==========================================
// PAGE READY
// ==========================================

console.log("🔔 AI SecurePay Notification Center Ready");

console.log("Run addDemoNotification() in the browser console to test notifications.");

// ==========================================
// END OF FILE
// ==========================================