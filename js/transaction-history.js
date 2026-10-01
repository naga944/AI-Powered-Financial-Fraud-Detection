// ==========================================
// AI SecurePay - Transaction History
// ==========================================

// ==========================================
// PAGE LOAD ANIMATION
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
// FILTER BUTTON
// ==========================================

const filterBtn=document.querySelector(".filter-btn");

if(filterBtn){

    filterBtn.addEventListener("click",()=>{

        alert(

`Filter Transactions

• All

• Money Sent

• Money Received

• Scan & Pay

• Bank Transfer`

        );

    });

}

// ==========================================
// CALENDAR BUTTON
// ==========================================

const calendarBtn=document.querySelector(".calendar-btn");

if(calendarBtn){

    calendarBtn.addEventListener("click",()=>{

        alert("Calendar feature coming soon.");

    });

}

// ==========================================
// LIVE SEARCH
// ==========================================

const searchInput=document.getElementById("searchInput");

let transactionCards=[];
const savedTransactions=JSON.parse(localStorage.getItem('transactionHistory') || '[]');
document.querySelectorAll('.transaction-section').forEach((section)=>section.remove());

const liveSection=document.createElement('section');
liveSection.className='transaction-section';
liveSection.innerHTML='<h2>Account activity</h2><div class="live-transaction-list"></div><p class="empty-transactions">No transfers recorded yet.</p>';
document.querySelector('.tabs-section')?.after(liveSection);
const liveList=liveSection.querySelector('.live-transaction-list');

savedTransactions.forEach((transaction)=>{
    const receiver=transaction.receiver_name || transaction.receiverName || 'Payee';
    const receiverId=transaction.receiver_number || transaction.receiverNumber || 'Recipient details unavailable';
    const amount=Number(String(transaction.amount || 0).replace(/[₹,]/g,''));
    const date=new Date(transaction.created_at || transaction.date || Date.now());
    const rawType=String(transaction.transaction_type || transaction.paymentType || transaction.receiverType || 'transfer').toLowerCase();
    const transferType=rawType.includes('scan') ? 'scan' : rawType.includes('bank') ? 'bank' : rawType.includes('contact') ? 'contact' : 'transfer';
    const card=document.createElement('article');
    card.className=`transaction-card ${transaction.type === 'Credit' ? 'received' : 'sent'}`;
    card.dataset.type=transferType;

    const left=document.createElement('div');
    left.className='left-section';
    const avatar=document.createElement('div');
    avatar.className='avatar purple';
    avatar.textContent=receiver.split(/\s+/).map((part)=>part[0]).join('').slice(0,2).toUpperCase();
    const details=document.createElement('div');
    details.className='details';
    const title=document.createElement('h3');
    title.textContent=`${transaction.type === 'Credit' ? 'Received from' : 'Paid to'} ${receiver}`;
    const identifier=document.createElement('p');
    identifier.textContent=receiverId;
    const timestamp=document.createElement('span');
    timestamp.textContent=date.toLocaleString('en-IN');
    details.append(title,identifier,timestamp);
    left.append(avatar,details);

    const right=document.createElement('div');
    right.className='right-section';
    const value=document.createElement('h3');
    value.className=transaction.type === 'Credit' ? 'credit' : 'debit';
    value.textContent=`${transaction.type === 'Credit' ? '+' : '-'} ₹${amount.toLocaleString('en-IN',{minimumFractionDigits:2})}`;
    const status=document.createElement('p');
    status.textContent=`${transaction.riskLevel || transaction.risk_level || 'Recorded'} risk review`;
    right.append(value,status);
    card.append(left,right);
    liveList.appendChild(card);
});

liveSection.querySelector('.empty-transactions').hidden=savedTransactions.length>0;
transactionCards=Array.from(liveList.querySelectorAll('.transaction-card'));

if(searchInput){

    searchInput.addEventListener("keyup",()=>{

        const value=searchInput.value.toLowerCase();

        transactionCards.forEach(card=>{

            const text=card.innerText.toLowerCase();

            if(text.includes(value)){

                card.style.display="flex";

            }

            else{

                card.style.display="none";

            }

        });

    });

}

// ==========================================
// FILTER TABS
// ==========================================

const tabs=document.querySelectorAll(".tab");

tabs.forEach(tab=>{

    tab.addEventListener("click",()=>{

        tabs.forEach(btn=>{

            btn.classList.remove("active");

        });

        tab.classList.add("active");

    });

});
// ==========================================
// FILTER TRANSACTIONS
// ==========================================

tabs.forEach(tab=>{

    tab.addEventListener("click",()=>{

        const filter=tab.innerText.toLowerCase();

        transactionCards.forEach(card=>{

            const title=card.querySelector(".details h3").innerText.toLowerCase();

            // Show All

            if(filter==="all"){

                card.style.display="flex";

            }

            // Money Sent

            else if(filter==="money sent"){

                if(title.includes("paid") || title.includes("transferred")){

                    card.style.display="flex";

                }

                else{

                    card.style.display="none";

                }

            }

            // Money Received

            else if(filter==="money received"){

                if(title.includes("received")){

                    card.style.display="flex";

                }

                else{

                    card.style.display="none";

                }

            }

            // Scan & Pay

            else if(filter==="scan & pay"){

                if(card.dataset.type === 'scan'){

                    card.style.display="flex";

                }

                else{

                    card.style.display="none";

                }

            }

            // Bank Transfer

            else if(filter==="bank transfer"){

                if(card.dataset.type === 'bank'){

                    card.style.display="flex";

                }

                else{

                    card.style.display="none";

                }

            }

        });

    });

});

// ==========================================
// TRANSACTION CLICK
// ==========================================

transactionCards.forEach(card=>{

    card.addEventListener("click",()=>{

        const fullTitle = card.querySelector(".details h3").innerText;

        const phone = "+91 98765 43210";

        const upi = fullTitle.toLowerCase()
            .replace("paid to ","")
            .replace("received from ","")
            .replace(/\s+/g,"") + "@oksbi";

        const name = fullTitle
            .replace("Paid to ","")
            .replace("Received from ","")
            .replace("Transferred to ","");

        const avatar = name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0,2)
            .toUpperCase();

        localStorage.setItem("userName", name);
        localStorage.setItem("userPhone", phone);
        localStorage.setItem("userAvatar", avatar);
        localStorage.setItem("userUpi", upi);

        window.location.href = "user-transactions.html";

    });

});
// ==========================================
// SUMMARY CARD
// ==========================================

const summaryCard = document.querySelector(".summary-card");

if(summaryCard){

    summaryCard.addEventListener("click",()=>{

        const sent= savedTransactions.filter((transaction)=>transaction.type !== 'Credit').reduce((sum, transaction)=>sum + Number(String(transaction.amount || 0).replace(/[₹,]/g,'')), 0);
        const received= savedTransactions.filter((transaction)=>transaction.type === 'Credit').reduce((sum, transaction)=>sum + Number(String(transaction.amount || 0).replace(/[₹,]/g,'')), 0);
        const flagged= savedTransactions.filter((transaction)=>['High','high'].includes(transaction.riskLevel || transaction.risk_level)).length;

        alert(

`Monthly Summary

Money Received : ₹${received.toLocaleString('en-IN')}

Money Sent : ₹${sent.toLocaleString('en-IN')}

Total Transactions : ${savedTransactions.length}

High-risk reviews : ${flagged}`

        );

    });

}

// ==========================================
// BOTTOM NAVIGATION
// ==========================================

const navItems=document.querySelectorAll(".bottom-nav a");

navItems.forEach(item=>{

    item.addEventListener("click",function(){

        navItems.forEach(link=>{

            link.classList.remove("active");

        });

        this.classList.add("active");

    });

});

// ==========================================
// CARD CLICK ANIMATION
// ==========================================

transactionCards.forEach(card=>{

    card.addEventListener("click",()=>{

        card.style.transform="scale(.97)";

        setTimeout(()=>{

            card.style.transform="scale(1)";

        },150);

    });

});

// ==========================================
// SUMMARY CARD ANIMATION
// ==========================================

if(summaryCard){

    summaryCard.addEventListener("mouseenter",()=>{

        summaryCard.style.transform="translateY(-3px)";

    });

    summaryCard.addEventListener("mouseleave",()=>{

        summaryCard.style.transform="translateY(0)";

    });

}

// ==========================================
// FILTER BUTTON ANIMATION
// ==========================================

const buttons=document.querySelectorAll("button");

buttons.forEach(button=>{

    button.addEventListener("click",()=>{

        button.style.transform="scale(.96)";

        setTimeout(()=>{

            button.style.transform="scale(1)";

        },120);

    });

});
// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown",(e)=>{

    // Focus Search

    if(e.key==="/"){

        e.preventDefault();

        searchInput.focus();

    }

    // Go Dashboard

    if(e.key==="Escape"){

        window.location.href="dashboard.html";

    }

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
// HOVER EFFECTS
// ==========================================

transactionCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 18px rgba(37,99,235,.30)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});

// ==========================================
// FILTER TAB EFFECT
// ==========================================

tabs.forEach(tab=>{

    tab.addEventListener("mouseenter",()=>{

        if(!tab.classList.contains("active")){

            tab.style.background="#334155";

        }

    });

    tab.addEventListener("mouseleave",()=>{

        if(!tab.classList.contains("active")){

            tab.style.background="";

        }

    });

});

// ==========================================
// SEARCH INPUT EFFECT
// ==========================================

if(searchInput){

    searchInput.addEventListener("focus",()=>{

        searchInput.parentElement.style.border="2px solid #2563EB";

    });

    searchInput.addEventListener("blur",()=>{

        searchInput.parentElement.style.border="2px solid transparent";

    });

}

// ==========================================
// SUMMARY CARD GLOW EFFECT
// ==========================================

if(summaryCard){

    summaryCard.addEventListener("mouseenter",()=>{

        summaryCard.style.boxShadow="0 0 30px rgba(37,99,235,.40)";

    });

    summaryCard.addEventListener("mouseleave",()=>{

        summaryCard.style.boxShadow="";

    });

}

// ==========================================
// PAGE READY MESSAGE
// ==========================================

console.log("AI SecurePay - Transaction History Loaded Successfully");

// ==========================================
// END OF FILE
// ==========================================