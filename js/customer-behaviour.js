// ==========================================
// AI SecurePay - Customer Behaviour
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

const behaviourScore=document.getElementById("behaviourScore");

const behaviourTitle=document.getElementById("behaviourTitle");

const behaviourText=document.getElementById("behaviourText");

const riskProfile=document.getElementById("riskProfile");

const monthlySpend=document.getElementById("monthlySpend");

const avgTransaction=document.getElementById("avgTransaction");

const transactionCount=document.getElementById("transactionCount");

const activeDays=document.getElementById("activeDays");

const totalSpend=document.getElementById("totalSpend");

const pieTotal=document.getElementById("pieTotal");

const categoryList=document.getElementById("categoryList");

const distributionList=document.getElementById("distributionList");

// ==========================================
// LOAD TRANSACTIONS
// ==========================================

const transactions=

JSON.parse(

localStorage.getItem("transactionHistory")

) || [];

// ==========================================
// DEFAULT VALUES
// ==========================================

let totalAmount=0;

let behaviour=transactions.length?100:0;

let uniqueDays=new Set();

let totalTransactions=transactions.length;

const monthlyTotals=new Map();
const categoryTotals=new Map();

// ==========================================
// ANALYSE TRANSACTIONS
// ==========================================

transactions.forEach(tx=>{

    const amount=

    Number(

        String(tx.amount)

        .replace(/[₹,]/g,"")

    ) || 0;

    totalAmount+=amount;

    const transactionDate=new Date(tx.created_at || tx.date || Date.now());
    const monthKey=`${transactionDate.getFullYear()}-${String(transactionDate.getMonth()+1).padStart(2,'0')}`;
    monthlyTotals.set(monthKey,(monthlyTotals.get(monthKey)||0)+amount);
    const rawType=String(tx.transaction_type || tx.transactionType || 'transfer').toLowerCase();
    const category=rawType.includes('scan')?'QR payments':rawType.includes('bank')?'Bank transfers':rawType.includes('self')?'Own account transfers':rawType.includes('contact')?'Contact payments':'Other transfers';
    categoryTotals.set(category,(categoryTotals.get(category)||0)+amount);

    if(tx.date){

        uniqueDays.add(

            tx.date.split(",")[0]

        );

    }

    if(amount>10000){

        behaviour-=8;

    }

    if(tx.status==="Failed"){

        behaviour-=15;

    }

    if(tx.status==="Suspicious"){

        behaviour-=25;

    }

});

// Keep score between 0 and 100

behaviour=Math.max(0,Math.min(100,behaviour));

const averageTransaction=

totalTransactions

?

Math.round(totalAmount/totalTransactions)

:0;
// ==========================================
// UPDATE BEHAVIOUR SCORE
// ==========================================

updateBehaviour();

function updateBehaviour(){

    if(!totalTransactions){
        behaviourScore.innerText='—';
        behaviourTitle.innerText='Awaiting activity';
        behaviourText.innerText='Record a demo transfer to build an account-specific behaviour summary.';
        riskProfile.innerHTML='<i class="fa-solid fa-circle-info"></i> Not enough data';
        riskProfile.style.background='#64748B';
        return;
    }

    behaviourScore.innerText=behaviour;

    if(behaviour>=80){

        behaviourTitle.innerText="Excellent Behaviour";

        behaviourText.innerText=

        "Your spending habits are healthy and your account activity is considered very safe.";

        riskProfile.innerHTML=

        '<i class="fa-solid fa-shield-halved"></i> Low Risk Profile';

        riskProfile.style.background="#22C55E";

    }

    else if(behaviour>=50){

        behaviourTitle.innerText="Good Behaviour";

        behaviourText.innerText=

        "Some high-value spending has been detected. Continue monitoring your transactions.";

        riskProfile.innerHTML=

        '<i class="fa-solid fa-triangle-exclamation"></i> Medium Risk Profile';

        riskProfile.style.background="#F59E0B";

    }

    else{

        behaviourTitle.innerText="Needs Attention";

        behaviourText.innerText=

        "AI has detected unusual spending behaviour. Review your recent transactions.";

        riskProfile.innerHTML=

        '<i class="fa-solid fa-circle-exclamation"></i> High Risk Profile';

        riskProfile.style.background="#EF4444";

    }

}

// ==========================================
// UPDATE STATISTICS
// ==========================================

const monthlyEntries=[...monthlyTotals.entries()].sort(([first],[second])=>first.localeCompare(second));
const latestMonths=monthlyEntries.slice(-6);
const latestMonthSpend=monthlyEntries.at(-1)?.[1]||0;
const averageMonthlySpend=monthlyTotals.size?Math.round(totalAmount/monthlyTotals.size):0;
const rangeSpend=(range)=>{
    const months=range==='Last 3 Months'?3:range==='This Year'?12:6;
    return monthlyEntries.slice(-months).reduce((sum,[,amount])=>sum+amount,0);
};

monthlySpend.innerText=

"₹"+averageMonthlySpend.toLocaleString("en-IN");

avgTransaction.innerText=

"₹"+averageTransaction.toLocaleString("en-IN");

transactionCount.innerText=

totalTransactions;

activeDays.innerText=

uniqueDays.size;

totalSpend.innerText=

"₹"+rangeSpend('Last 6 Months').toLocaleString("en-IN");

pieTotal.innerText=

"₹"+totalAmount.toLocaleString("en-IN");

for (const [id,label] of [['monthlyChange','month comparison unavailable'],['avgChange','based on saved records'],['transactionChange','saved transfers'],['daysChange','recorded active days']]) {
    const element=document.getElementById(id);
    if(element) element.textContent=transactions.length?label:'No activity yet';
}

// ==========================================
// SCORE ANIMATION
// ==========================================

if(totalTransactions){
    let currentScore=0;
    const scoreTimer=setInterval(()=>{
        currentScore++;
        behaviourScore.innerText=currentScore;
        if(currentScore>=behaviour) clearInterval(scoreTimer);
    },20);
}else{
    behaviourScore.innerText='—';
}

// ==========================================
// INFO BUTTON
// ==========================================

const infoBtn=document.getElementById("infoBtn");

infoBtn.addEventListener("click",()=>{

    alert(

`Customer Behaviour Analysis

• Spending Pattern

• Transaction Frequency

• Active Days

• Payment Behaviour

• AI Risk Detection

• Monthly Spending

The behaviour score updates automatically based on your transaction history.`

    );

});
// ==========================================
// TOP SPENDING CATEGORIES
// ==========================================

const categoryColors=['#2f7f75','#d8a141','#5482c1','#b65f6a','#718750'];
const categories=[...categoryTotals.entries()].map(([name,amount],index)=>({
    name,
    amount,
    color:categoryColors[index%categoryColors.length]
}));

// ==========================================
// DISPLAY CATEGORIES
// ==========================================

categoryList.innerHTML="";

distributionList.innerHTML="";

categories.forEach(category=>{

    categoryList.innerHTML+=`

    <div class="category-item">

        <div class="category-left">

            <span class="category-dot"

            style="background:${category.color}">

            </span>

            <h4>${category.name}</h4>

        </div>

        <strong>

            ₹${category.amount.toLocaleString("en-IN")}

        </strong>

    </div>

    `;

    distributionList.innerHTML+=`

    <div class="distribution-item">

        <div class="category-left">

            <span class="category-dot"

            style="background:${category.color}">

            </span>

            <span>${category.name}</span>

        </div>

        <strong>

            ${Math.round((category.amount/totalAmount)*100)||0}%

        </strong>

    </div>

    `;

});

if(!categories.length){
    categoryList.textContent='Categories will appear after a transfer is recorded.';
    distributionList.textContent='No spending distribution is available yet.';
}

// ==========================================
// AI INSIGHTS
// ==========================================

document.getElementById("insight1").innerText=

`You completed ${totalTransactions} transactions successfully.`;

document.getElementById("insight2").innerText=

`Average transaction value is ₹${averageTransaction.toLocaleString("en-IN")}.`;

document.getElementById("insight3").innerText=

`Your account was active for ${uniqueDays.size} different days.`;

if(!totalTransactions){
    document.getElementById('insight4').innerText='Not enough transfer history is available for a behaviour assessment.';
}
else if(behaviour>=80){

    document.getElementById("insight4").innerText=

    "Excellent spending behaviour detected. Keep using trusted payment methods.";

}

else if(behaviour>=50){

    document.getElementById("insight4").innerText=

    "Moderate spending behaviour detected. Avoid unnecessary high-value transfers.";

}

else{

    document.getElementById("insight4").innerText=

    "AI recommends reviewing recent transactions and enabling extra security.";

}

// ==========================================
// SPENDING TREND
// ==========================================

const savingPercent=document.getElementById("savingPercent");

if(savingPercent) savingPercent.innerText=transactions.length?'Based on recorded transfers':'No comparison available';
// ==========================================
// MONTH FILTER
// ==========================================

const monthFilter=document.getElementById("monthFilter");

monthFilter.addEventListener("change",()=>{
    totalSpend.innerText="₹"+rangeSpend(monthFilter.value).toLocaleString("en-IN");

});

// ==========================================
// VIEW ALL INSIGHTS
// ==========================================

const viewInsights=document.getElementById("viewInsights");

viewInsights.addEventListener("click",()=>{

    alert(

`AI Customer Behaviour Report

• Behaviour Score : ${behaviour}/100

• Total Transactions : ${totalTransactions}

• Total Spending : ₹${totalAmount.toLocaleString("en-IN")}

• Average Transaction : ₹${averageTransaction.toLocaleString("en-IN")}

• Active Days : ${uniqueDays.size}

Overall Behaviour : ${behaviourTitle.innerText}`

    );

});

// ==========================================
// LEARN MORE
// ==========================================

const learnMore=document.getElementById("learnMore");

learnMore.addEventListener("click",()=>{

    alert(

`AI Behaviour Protection

✔ Spending Pattern Analysis

✔ Fraud Detection

✔ Behaviour Monitoring

✔ Trusted Device Verification

✔ Risk Prediction

✔ Secure Transaction Monitoring

AI SecurePay continuously protects your account.`

    );

});

// ==========================================
// GRAPH ANIMATION
// ==========================================

const graphPoints=document.querySelectorAll(".point");

graphPoints.forEach((point,index)=>{

    point.style.animationDelay=`${index*0.2}s`;

});

const behaviourTransactionList=document.getElementById('behaviourTransactionList');
if(behaviourTransactionList){
    behaviourTransactionList.replaceChildren();
    transactions.forEach((transaction)=>{
        const row=document.createElement('article');
        row.className='behaviour-transaction-row';
        const name=document.createElement('strong');
        name.textContent=transaction.receiver_name||transaction.receiverName||'Transfer';
        const detail=document.createElement('span');
        detail.textContent=`${transaction.transaction_type||'transfer'} · ${transaction.riskLevel||transaction.risk_level||'review pending'}`;
        const amount=document.createElement('b');
        amount.textContent=`₹${(Number(String(transaction.amount||0).replace(/[₹,]/g,''))||0).toLocaleString('en-IN')}`;
        row.append(name,detail,amount);
        behaviourTransactionList.appendChild(row);
    });
    if(!transactions.length) behaviourTransactionList.textContent='No transfers recorded for this account yet.';
}

const behaviourTrendChart=document.getElementById('behaviourTrendChart');
if(behaviourTrendChart){
    behaviourTrendChart.replaceChildren();
    const maxSpend=Math.max(1,...latestMonths.map(([,amount])=>amount));
    latestMonths.forEach(([month,amount])=>{
        const item=document.createElement('div');
        item.className='behaviour-trend-item';
        const bar=document.createElement('div');
        bar.className='behaviour-trend-bar';
        bar.style.height=`${Math.max(6,Math.round(amount/maxSpend*100))}%`;
        bar.title=`₹${amount.toLocaleString('en-IN')}`;
        const label=document.createElement('span');
        label.textContent=month;
        item.append(bar,label);
        behaviourTrendChart.appendChild(item);
    });
    document.getElementById('behaviourTrendSummary').textContent=latestMonths.length
        ? `₹${latestMonths.reduce((sum,[,amount])=>sum+amount,0).toLocaleString('en-IN')} across ${latestMonths.length} active month${latestMonths.length===1?'':'s'}.`
        : 'Monthly trend will appear after transfers are recorded.';
}

// ==========================================
// TABS
// ==========================================

const tabs=document.querySelectorAll(".tab");

tabs.forEach(tab=>{

    tab.addEventListener("click",()=>{

        tabs.forEach(t=>t.classList.remove("active"));

        tab.classList.add("active");
        document.querySelectorAll('[data-behaviour-view]').forEach((panel)=>{
            panel.hidden=panel.dataset.behaviourView!==tab.dataset.view;
        });

    });

});

document.querySelectorAll('[data-behaviour-view]').forEach((panel)=>{
    panel.hidden=panel.dataset.behaviourView!=='overview';
});

// ==========================================
// AUTO REFRESH
// ==========================================

window.addEventListener("storage",()=>{

    location.reload();

});

// ==========================================
// PAGE READY
// ==========================================

console.log("Customer Behaviour Dashboard Loaded Successfully");
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

    // R → Refresh Behaviour Analysis

    if(e.key==="r" || e.key==="R"){

        location.reload();

    }

});

// ==========================================
// CARD HOVER EFFECTS
// ==========================================

const cards=document.querySelectorAll(

".stat-card,.category-card,.distribution-card,.insights-card"

);

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 25px rgba(37,99,235,.30)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});

// ==========================================
// INSIGHT ANIMATION
// ==========================================

const insightItems=document.querySelectorAll(".insight-item");

insightItems.forEach((item,index)=>{

    item.style.opacity="0";

    item.style.transform="translateX(-20px)";

    setTimeout(()=>{

        item.style.transition=".5s ease";

        item.style.opacity="1";

        item.style.transform="translateX(0)";

    },index*200);

});

// ==========================================
// GRAPH POINT ANIMATION
// ==========================================

graphPoints.forEach((point,index)=>{

    setInterval(()=>{

        point.style.transform="scale(1.4)";

        setTimeout(()=>{

            point.style.transform="scale(1)";

        },300);

    },2500+(index*200));

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

    const latestTransactions=

    JSON.parse(

        localStorage.getItem("transactionHistory")

    ) || [];

    if(latestTransactions.length!==transactions.length){

        location.reload();

    }

},30000);

// ==========================================
// AI STATUS
// ==========================================

console.log(

"🧠 AI SecurePay Customer Behaviour Ready"

);

// ==========================================
// END OF FILE
// ==========================================