// ==========================================
// AI SecurePay - Fraud Alerts
// ==========================================

// ==========================================
// ELEMENTS
// ==========================================

const alertContainer =
document.getElementById("alertContainer");

const emptyAlert =
document.getElementById("emptyAlert");

const searchAlert =
document.getElementById("searchAlert");

const highAlerts =
document.getElementById("highAlerts");

const mediumAlerts =
document.getElementById("mediumAlerts");

const lowAlerts =
document.getElementById("lowAlerts");

const totalAlerts =
document.getElementById("totalAlerts");

const alertCount =
document.getElementById("alertCount");

const lastScan =
document.getElementById("lastScan");

// ==========================================
// LOAD ALERTS
// ==========================================

let fraudAlerts =

JSON.parse(

localStorage.getItem("fraudAlerts")

) || [];

fraudAlerts = fraudAlerts.filter((alert) => !['Unusual Transaction', 'Wrong UPI PIN', 'Low Balance'].includes(alert.title));
localStorage.setItem('fraudAlerts', JSON.stringify(fraudAlerts));

// ==========================================
// COUNTERS
// ==========================================

let high=0;

let medium=0;

let low=0;

fraudAlerts.forEach(alert=>{

    if(alert.level==="High"){

        high++;

    }

    else if(alert.level==="Medium"){

        medium++;

    }

    else{

        low++;

    }

});

highAlerts.innerHTML=high;

mediumAlerts.innerHTML=medium;

lowAlerts.innerHTML=low;

totalAlerts.innerHTML=fraudAlerts.length;

alertCount.innerHTML=fraudAlerts.length;

// ==========================================
// LAST SCAN
// ==========================================

lastScan.innerHTML=

new Date().toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

});
// ==========================================
// DISPLAY ALERTS
// ==========================================

displayAlerts(fraudAlerts);

function displayAlerts(alerts){

    alertContainer.innerHTML="";

    if(alerts.length===0){

        emptyAlert.style.display="block";

        return;

    }

    emptyAlert.style.display="none";

    alerts.forEach((alert,index)=>{

        let badgeClass="low-risk";

        let icon="fa-circle-info";

        if(alert.level==="High"){

            badgeClass="high-risk";

            icon="fa-triangle-exclamation";

        }

        else if(alert.level==="Medium"){

            badgeClass="medium-risk";

            icon="fa-circle-exclamation";

        }

        const card=document.createElement("div");

        card.className="alert-card";

        card.innerHTML=`

            <div class="alert-header">

                <div class="alert-user">

                    <div class="alert-avatar">

                        <i class="fa-solid ${icon}"></i>

                    </div>

                    <div>

                        <h3>${alert.title || "Fraud Alert"}</h3>

                        <p>${alert.reason}</p>

                    </div>

                </div>

                <span class="risk-badge ${badgeClass}">

                    ${alert.level}

                </span>

            </div>

            <div class="alert-details">

                <div class="detail-box">

                    <small>User</small>

                    <span>${alert.name}</span>

                </div>

                <div class="detail-box">

                    <small>Amount</small>

                    <span>${alert.amount}</span>

                </div>

                <div class="detail-box">

                    <small>Date</small>

                    <span>${alert.date}</span>

                </div>

                <div class="detail-box">

                    <small>Time</small>

                    <span>${alert.time}</span>

                </div>

            </div>

            <div class="alert-actions">

                <button
                    class="resolve-btn"
                    onclick="resolveAlert(${index})">

                    <i class="fa-solid fa-check"></i>

                    Resolve

                </button>

                <button
                    class="ignore-btn"
                    onclick="ignoreAlert(${index})">

                    <i class="fa-solid fa-xmark"></i>

                    Ignore

                </button>

            </div>

        `;

        alertContainer.appendChild(card);

    });

}
// ==========================================
// SEARCH ALERTS
// ==========================================

searchAlert.addEventListener("keyup",()=>{

    const keyword=

    searchAlert.value.toLowerCase();

    const filtered=

    fraudAlerts.filter(alert=>{

        return(

            (alert.title||"").toLowerCase().includes(keyword)||

            (alert.name||"").toLowerCase().includes(keyword)||

            (alert.reason||"").toLowerCase().includes(keyword)||

            (alert.level||"").toLowerCase().includes(keyword)||

            (alert.amount||"").toLowerCase().includes(keyword)

        );

    });

    displayAlerts(filtered);

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

            displayAlerts(fraudAlerts);

            return;

        }

        const filtered=

        fraudAlerts.filter(alert=>

            alert.level.toLowerCase()===

            filter.toLowerCase()

        );

        displayAlerts(filtered);

    });

});

// ==========================================
// UPDATE COUNTERS
// ==========================================

function updateCounters(){

    let high=0;

    let medium=0;

    let low=0;

    fraudAlerts.forEach(alert=>{

        if(alert.level==="High"){

            high++;

        }

        else if(alert.level==="Medium"){

            medium++;

        }

        else{

            low++;

        }

    });

    highAlerts.innerHTML=high;

    mediumAlerts.innerHTML=medium;

    lowAlerts.innerHTML=low;

    totalAlerts.innerHTML=

    fraudAlerts.length;

    alertCount.innerHTML=

    fraudAlerts.length;

}

updateCounters();

// ==========================================
// REFRESH ALERT LIST
// ==========================================

function refreshAlerts(){

    fraudAlerts=

    JSON.parse(

        localStorage.getItem("fraudAlerts")

    ) || [];

    updateCounters();

    displayAlerts(fraudAlerts);

}
// ==========================================
// RESOLVE ALERT
// ==========================================

function resolveAlert(index){

    if(confirm("Mark this alert as resolved?")){

        fraudAlerts[index].status="Resolved";

        fraudAlerts[index].resolvedAt=

        new Date().toLocaleString();

        localStorage.setItem(

            "fraudAlerts",

            JSON.stringify(fraudAlerts)

        );

        alert("✅ Alert resolved successfully.");

        refreshAlerts();

    }

}

// ==========================================
// IGNORE ALERT
// ==========================================

function ignoreAlert(index){

    if(confirm("Ignore this alert?")){

        fraudAlerts[index].status="Ignored";

        localStorage.setItem(

            "fraudAlerts",

            JSON.stringify(fraudAlerts)

        );

        alert("Alert ignored.");

        refreshAlerts();

    }

}

// ==========================================
// DELETE ALERT
// ==========================================

function deleteAlert(index){

    if(confirm("Delete this alert permanently?")){

        fraudAlerts.splice(index,1);

        localStorage.setItem(

            "fraudAlerts",

            JSON.stringify(fraudAlerts)

        );

        refreshAlerts();

    }

}

// ==========================================
// VIEW ALL BUTTON
// ==========================================

const viewAllBtn=

document.getElementById("viewAllBtn");

viewAllBtn.addEventListener("click",()=>{

    displayAlerts(fraudAlerts);

});

// ==========================================
// AUTO SAVE
// ==========================================

function saveAlerts(){

    localStorage.setItem(

        "fraudAlerts",

        JSON.stringify(fraudAlerts)

    );

}

// ==========================================
// STORAGE SYNC
// ==========================================

window.addEventListener("storage",()=>{

    refreshAlerts();

});

// ==========================================
// PAGE REFRESH
// ==========================================

refreshAlerts();
// ==========================================
// NOTIFICATION BUTTON
// ==========================================

const notificationBtn=document.getElementById("notificationBtn");

notificationBtn.addEventListener("click",()=>{

    alert(

`AI SecurePay Notifications

High Risk Alerts : ${highAlerts.innerText}

Medium Risk Alerts : ${mediumAlerts.innerText}

Low Risk Alerts : ${lowAlerts.innerText}

Total Alerts : ${totalAlerts.innerText}`

    );

});

// ==========================================
// CONTACT SUPPORT
// ==========================================

const supportBtn=document.getElementById("supportBtn");

supportBtn.addEventListener("click",()=>{

    alert(

`AI SecurePay Support

Customer Care : 1800-123-4567

Email : support@aisecurepay.com

Available 24 × 7`

    );

});

// ==========================================
// REPORT FRAUD
// ==========================================

const reportBtn=document.getElementById("reportBtn");

reportBtn.addEventListener("click",()=>{

    const reason=prompt(

"Briefly describe the fraud:"

    );

    if(reason!==null){

        alert(

`Fraud Report Submitted

Reference ID :

FRD${Date.now().toString().slice(-6)}

Thank you for reporting.`

        );

    }

});

// ==========================================
// UPDATE LAST SCAN
// ==========================================

function updateLastScan(){

    lastScan.innerHTML=

    new Date().toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit",

        second:"2-digit"

    });

}

updateLastScan();

setInterval(updateLastScan,1000);

// ==========================================
// AUTO REFRESH ALERTS
// ==========================================

setInterval(()=>{

    refreshAlerts();

},5000);

// ==========================================
// PAGE ANIMATION
// ==========================================

window.addEventListener("load",()=>{

    const cards=

    document.querySelectorAll(

        ".summary-card,.alert-card,.tip-item,.status-box"

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

// ==========================================
// PAGE READY
// ==========================================

console.log("🛡 AI SecurePay Fraud Alerts Ready");
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

    // ESC → Close search

    if(e.key==="Escape"){

        searchAlert.value="";

        displayAlerts(fraudAlerts);

    }

    // Ctrl + F → Focus Search

    if(e.ctrlKey && e.key==="f"){

        e.preventDefault();

        searchAlert.focus();

    }

});

// ==========================================
// CLEAR ALL ALERTS
// ==========================================

function clearAllAlerts(){

    if(confirm("Delete all fraud alerts?")){

        fraudAlerts=[];

        localStorage.setItem(

            "fraudAlerts",

            JSON.stringify(fraudAlerts)

        );

        refreshAlerts();

        alert("All alerts cleared.");

    }

}

// ==========================================
// EXPORT ALERTS
// ==========================================

function exportAlerts(){

    const blob=new Blob(

        [

            JSON.stringify(

                fraudAlerts,

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

    const a=

    document.createElement("a");

    a.href=url;

    a.download="fraud-alerts.json";

    a.click();

    URL.revokeObjectURL(url);

}

// ==========================================
// AUTO SYNC
// ==========================================

window.addEventListener("storage",()=>{

    refreshAlerts();

});

// ==========================================
// AUTO UPDATE EVERY 10 SECONDS
// ==========================================

setInterval(()=>{

    refreshAlerts();

},10000);

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
// DEMO FUNCTIONS
// (For Testing)
// ==========================================

// Call addDemoAlert() in browser console
// to create a sample alert.

function addDemoAlert(){

    fraudAlerts.unshift({

        id:Date.now(),

        title:"AI Verification Failed",

        name:"Demo User",

        amount:"₹12,500",

        level:"High",

        reason:"User rejected verification",

        status:"Pending",

        date:new Date().toLocaleDateString(),

        time:new Date().toLocaleTimeString()

    });

    localStorage.setItem(

        "fraudAlerts",

        JSON.stringify(fraudAlerts)

    );

    refreshAlerts();

}

// ==========================================
// PAGE READY
// ==========================================

console.log("🛡 AI SecurePay Fraud Alert Center Ready");

console.log("Type addDemoAlert() in the browser console to test alerts.");

// ==========================================
// END OF FILE
// ==========================================