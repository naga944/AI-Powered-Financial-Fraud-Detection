// ==========================================
// AI SecurePay - Self Transfer
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
// SELECT ELEMENTS
// ==========================================

const accountCards=document.querySelectorAll(".account-card");

const continueBtn=document.getElementById("continueBtn");

const amountInput=document.getElementById("amount");

const amountWords=document.getElementById("amountWords");

const noteInput=document.getElementById("note");

const noteCount=document.getElementById("noteCount");

const quickBtns=document.querySelectorAll(".quick-btn");

const successModal=document.getElementById("successModal");

const doneBtn=document.getElementById("doneBtn");

const successAmount=document.getElementById("successAmount");

const successBank=document.getElementById("successBank");

const txnId=document.getElementById("txnId");

// ==========================================
// ACCOUNT DETAILS
// ==========================================

const accounts=[

{

    bank:"State Bank of India",

    account:"Savings Account",

    number:"XXXX XXXX 4321"

},

{

    bank:"Axis Bank",

    account:"Savings Account",

    number:"XXXX XXXX 5678"

}

];

let selectedAccount=accounts[0];

// ==========================================
// ACCOUNT SELECTION
// ==========================================

accountCards.forEach((card,index)=>{

    card.addEventListener("click",()=>{

        accountCards.forEach(c=>{

            c.classList.remove("active");

            c.querySelector(".radio").classList.remove("selected");

            c.querySelector(".radio i").className="fa-regular fa-circle";

        });

        card.classList.add("active");

        card.querySelector(".radio").classList.add("selected");

        card.querySelector(".radio i").className="fa-solid fa-circle-dot";

        selectedAccount=accounts[index];

    });

});

// ==========================================
// QUICK AMOUNT BUTTONS
// ==========================================

quickBtns.forEach(btn=>{

    btn.addEventListener("click",()=>{

        const amount=btn.innerText
            .replace("₹","")
            .replace(",","");

        amountInput.value=amount;

        amountInput.dispatchEvent(new Event("input"));

    });

});
// ==========================================
// NOTE CHARACTER COUNTER
// ==========================================

noteInput.addEventListener("input",()=>{

    noteCount.innerText=
    `${noteInput.value.length}/40`;

});

// ==========================================
// AMOUNT VALIDATION
// ==========================================

amountInput.addEventListener("input",()=>{

    // Remove invalid characters

    amountInput.value=amountInput.value.replace(/[^0-9]/g,"");

    // Prevent negative numbers

    if(Number(amountInput.value)<0){

        amountInput.value="";

    }

    // Update amount in words

    updateAmountWords(Number(amountInput.value));

});

// ==========================================
// AMOUNT TO WORDS
// ==========================================

function updateAmountWords(amount){

    if(!amount || amount===0){

        amountWords.innerText="Rupees Zero Only";

        return;

    }

    amountWords.innerText=
    "Rupees " + convertNumber(amount) + " Only";

}

// ==========================================
// NUMBER TO WORDS
// ==========================================

function convertNumber(num){

    const ones=[

        "",

        "One","Two","Three","Four","Five",

        "Six","Seven","Eight","Nine",

        "Ten","Eleven","Twelve","Thirteen",

        "Fourteen","Fifteen","Sixteen",

        "Seventeen","Eighteen","Nineteen"

    ];

    const tens=[

        "",

        "",

        "Twenty","Thirty","Forty",

        "Fifty","Sixty","Seventy",

        "Eighty","Ninety"

    ];

    if(num<20){

        return ones[num];

    }

    if(num<100){

        return tens[Math.floor(num/10)] +

        (num%10 ? " "+ones[num%10] : "");

    }

    if(num<1000){

        return ones[Math.floor(num/100)] +

        " Hundred" +

        (num%100 ? " "+convertNumber(num%100) : "");

    }

    if(num<100000){

        return convertNumber(Math.floor(num/1000)) +

        " Thousand" +

        (num%1000 ? " "+convertNumber(num%1000) : "");

    }

    if(num<10000000){

        return convertNumber(Math.floor(num/100000)) +

        " Lakh" +

        (num%100000 ? " "+convertNumber(num%100000) : "");

    }

    return num.toLocaleString("en-IN");

}

// ==========================================
// PREVENT EMPTY AMOUNT
// ==========================================

function validateAmount(){

    const amount=Number(amountInput.value);

    if(amount<=0){

        alert("Please enter a valid transfer amount.");

        amountInput.focus();

        return false;

    }

    return true;

}
// ==========================================
// CONTINUE TRANSFER
// ==========================================

continueBtn.addEventListener("click",()=>{

    if(!validateAmount()) return;

    continueBtn.disabled=true;

    continueBtn.innerHTML=`

        <i class="fa-solid fa-spinner fa-spin"></i>

        AI Verifying...

    `;

    // Simulate AI Verification

    setTimeout(()=>{

        const amount="₹"+Number(amountInput.value).toLocaleString("en-IN");

        const transactionId=
        "TXN"+
        Date.now().toString().slice(-8);

        successAmount.innerText=amount;

        successBank.innerText=selectedAccount.bank;

        txnId.innerText=transactionId;

        successModal.style.display="flex";

        continueBtn.disabled=false;

        continueBtn.innerHTML=`

            <span>

                Continue to Transfer

            </span>

            <i class="fa-solid fa-arrow-right"></i>

        `;

    },2000);

});

// ==========================================
// CLOSE SUCCESS MODAL
// ==========================================

window.addEventListener("click",(e)=>{

    if(e.target===successModal){

        successModal.style.display="none";

    }

});

// ==========================================
// SUCCESS ANIMATION
// ==========================================

const successIcon=document.querySelector(".success-icon");

if(successIcon){

    successIcon.addEventListener("mouseenter",()=>{

        successIcon.style.transform="scale(1.1)";

    });

    successIcon.addEventListener("mouseleave",()=>{

        successIcon.style.transform="scale(1)";

    });

}

// ==========================================
// GENERATE DATE & TIME
// ==========================================

function getCurrentDate(){

    return new Date().toLocaleString("en-IN",{

        day:"2-digit",

        month:"short",

        year:"numeric",

        hour:"2-digit",

        minute:"2-digit"

    });

}
// ==========================================
// SAVE TRANSACTION
// ==========================================

async function saveTransaction(){

    const amount="₹"+Number(amountInput.value)
    .toLocaleString("en-IN");

    const api = window.AISecurePayAPI;
    if (!api?.getToken()) {
        window.location.href = 'mobile-verification.html';
        return false;
    }

    try {
        const result = await api.request('/api/transactions', {
            method: 'POST',
            body: {
                amount: Number(amountInput.value),
                receiverName: `Own account - ${selectedAccount.bank}`,
                receiverNumber: selectedAccount.number,
                note: noteInput.value || 'Self Account demo transfer',
                transactionType: 'self',
                authorized: true,
                hasRiskFlags: false
            }
        });
        const createdAt = new Date(result.transaction.created_at || Date.now());
        const transaction = {
            id: result.transaction.id,
            receiver_name: result.transaction.receiver_name,
            receiver_number: result.transaction.receiver_number,
            transaction_type: 'self',
            amount: result.transaction.amount,
            note: result.transaction.note,
            date: `${createdAt.toLocaleDateString()}, ${createdAt.toLocaleTimeString()}`,
            status: result.risk.riskLevel === 'High' ? 'Suspicious' : 'Success',
            riskLevel: result.risk.riskLevel,
            riskScore: result.risk.riskScore,
            type: 'Debit'
        };
        const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
        history.unshift(transaction);
        localStorage.setItem('transactionHistory', JSON.stringify(history));
        alert(`Demo transfer recorded for risk review (${result.risk.riskLevel}). No money moved.`);
        return true;
    } catch (error) {
        alert(error.message || 'Unable to save the demo transfer.');
        return false;
    }

}

// ==========================================
// DONE BUTTON
// ==========================================

doneBtn.addEventListener("click",async()=>{

    // Save transfer

    const saved = await saveTransaction();
    if (!saved) return;

    // Close popup

    successModal.style.display="none";

    // Redirect

    window.location.href="transaction-history.html";

});

// ==========================================
// BOTTOM NAVIGATION
// ==========================================

const navLinks=document.querySelectorAll(".bottom-nav a");

navLinks.forEach(link=>{

    link.addEventListener("click",function(){

        navLinks.forEach(item=>{

            item.classList.remove("active");

        });

        this.classList.add("active");

    });

});

// ==========================================
// BUTTON ANIMATION
// ==========================================

const buttons=document.querySelectorAll("button");

buttons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        btn.style.transform="scale(.96)";

        setTimeout(()=>{

            btn.style.transform="scale(1)";

        },120);

    });

});

// ==========================================
// PAGE READY
// ==========================================

console.log("AI SecurePay - Self Transfer Loaded Successfully");

// ==========================================
// END OF FILE
// ==========================================
