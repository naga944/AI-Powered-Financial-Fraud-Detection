// ==========================================
// AI SecurePay - Enter Amount
// ==========================================

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load", () => {

    const container = document.querySelector(".container");

    if(container){

        container.style.opacity = "0";
        container.style.transform = "translateY(20px)";

        setTimeout(() => {

            container.style.transition = ".6s";

            container.style.opacity = "1";

            container.style.transform = "translateY(0)";

        },200);

    }

});

// ==========================================
// LOAD RECEIVER DETAILS
// ==========================================

const receiverName = document.getElementById("receiverName");

const receiverNumber = document.getElementById("receiverNumber");

const receiverAvatar = document.getElementById("receiverAvatar");

const popupReceiver = document.getElementById("popupReceiver");

const successReceiver = document.getElementById("successReceiver");

// Load selected contact from Pay to Contact

const savedName = localStorage.getItem("receiverName");

const savedNumber = localStorage.getItem("receiverNumber");

const savedAvatar = localStorage.getItem("receiverAvatar");

if(savedName){

    receiverName.textContent = savedName;

    popupReceiver.textContent = savedName;

    successReceiver.textContent = savedName;

}

if(savedNumber){

    receiverNumber.textContent = savedNumber;

}

if(savedAvatar){

    receiverAvatar.textContent = savedAvatar;

}

// ==========================================
// AMOUNT INPUT
// ==========================================

const amountInput = document.getElementById("amount");

let currentAmount = "";

const qrAmount = Number(localStorage.getItem('qrAmount') || 0);
if (qrAmount > 0 && amountInput) {
    currentAmount = String(qrAmount);
    amountInput.value = currentAmount;
}

// ==========================================
// NUMBER KEYPAD
// ==========================================

const keys = document.querySelectorAll(".key");

keys.forEach(key=>{

    key.addEventListener("click",()=>{

        const value = key.dataset.key;

        if(value===undefined) return;

        if(currentAmount==="0"){

            currentAmount="";

        }

        if(currentAmount.length<9){

            currentAmount += value;

        }

        amountInput.value=currentAmount;

    });

});

// ==========================================
// DELETE BUTTON
// ==========================================

const deleteKey=document.getElementById("deleteKey");

deleteKey.addEventListener("click",()=>{

    currentAmount=currentAmount.slice(0,-1);

    if(currentAmount===""){

        currentAmount="0";

    }

    amountInput.value=currentAmount;

});

// ==========================================
// QUICK AMOUNT BUTTONS
// ==========================================

const quickButtons=document.querySelectorAll(".quick-btn");

quickButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        currentAmount=button.dataset.amount;

        amountInput.value=currentAmount;

    });

});

// ==========================================
// CHANGE RECEIVER
// ==========================================

const changeBtn=document.getElementById("changeReceiver");

if(changeBtn){

    changeBtn.addEventListener("click",()=>{

        history.back();

    });

}

// ==========================================
// ADD NOTE
// ==========================================

const noteBtn=document.querySelector(".note-btn");

if(noteBtn){

    noteBtn.addEventListener("click",()=>{

        const note=prompt("Add payment note");

        if(note){

            alert("Note Added\n\n"+note);

        }

    });

}
// ==========================================
// AI FRAUD DETECTION
// ==========================================

const continueBtn = document.getElementById("continueBtn");

const verifyPopup = document.getElementById("verifyPopup");

const successPopup = document.getElementById("successPopup");

const fraudPopup = document.getElementById("fraudPopup");

const freezePopup = document.getElementById("freezePopup");

const popupAmount = document.getElementById("popupAmount");

const successAmount = document.getElementById("successAmount");

const yesBtn = document.getElementById("yesBtn");

const noBtn = document.getElementById("noBtn");
const stepUpPassword = document.getElementById('stepUpPassword');
const verifyStepUpButton = document.getElementById('verifyStepUpButton');
const stepUpStatus = document.getElementById('stepUpStatus');
const stepUpContext = document.getElementById('stepUpContext');
let stepUpToken = '';

// ==========================================
// CONTINUE BUTTON
// ==========================================

continueBtn.addEventListener("click",()=>{

    let amount = parseFloat(amountInput.value);

    if(isNaN(amount) || amount<=0){

        alert("Please enter a valid amount.");

        return;

    }

    // Update Popup Details

    popupReceiver.innerHTML = receiverName.innerHTML;

    popupAmount.innerHTML = "₹" + amount.toFixed(2);

    successReceiver.innerHTML = receiverName.innerHTML;

    successAmount.innerHTML = "₹" + amount.toFixed(2);

    stepUpToken = '';
    yesBtn.disabled = amount > 5000;
    if (stepUpPassword) stepUpPassword.value = '';
    if (stepUpStatus) stepUpStatus.textContent = amount > 5000
        ? 'Password is not stored. SMS OTP and biometric providers are not configured in this demo.'
        : '';
    if (stepUpContext) {
        const device = navigator.userAgentData?.platform || navigator.platform || 'Browser device';
        stepUpContext.textContent = `Recipient: ${receiverNumber.textContent.trim()} · Device: ${device} · Local time: ${new Date().toLocaleString()}`;
    }

    // AI Check

    if(amount>5000){

        verifyPopup.classList.add("show");

    }

    else{

        successPopup.classList.add("show");

    }

});

// ==========================================
// USER CLICKED YES
// ==========================================

yesBtn.addEventListener("click",()=>{

    if (Number(amountInput.value) > 5000 && !stepUpToken) {
        if (stepUpStatus) stepUpStatus.textContent = 'Verify your account password before confirming this high-value transfer.';
        return;
    }

    verifyPopup.classList.remove("show");

    successPopup.classList.add("show");

});

verifyStepUpButton?.addEventListener('click', async () => {
    const api = window.AISecurePayAPI;
    if (!api?.getToken()) {
        window.location.href = 'mobile-verification.html';
        return;
    }
    verifyStepUpButton.disabled = true;
    stepUpStatus.textContent = 'Checking account password…';
    try {
        const result = await api.request('/api/auth/step-up', {
            method: 'POST',
            body: {
                password: stepUpPassword.value,
                amount: Number(amountInput.value),
                receiverNumber: receiverNumber.textContent.trim(),
            },
        });
        stepUpToken = result.stepUpToken;
        stepUpPassword.value = '';
        yesBtn.disabled = false;
        stepUpStatus.textContent = 'Account confirmed for this recipient and amount. The approval expires in five minutes and can be used once.';
    } catch (error) {
        stepUpToken = '';
        yesBtn.disabled = true;
        stepUpStatus.textContent = error.message || 'Password verification failed.';
    } finally {
        verifyStepUpButton.disabled = false;
    }
});

// ==========================================
// USER CLICKED NO
// ==========================================

noBtn.addEventListener("click",()=>{

    verifyPopup.classList.remove("show");

    fraudPopup.classList.add("show");

});
// ==========================================
// PAYMENT SUCCESS
// ==========================================

const successBtn = document.getElementById("successBtn");

async function saveTransactionToDatabase() {

    const amount = Number(amountInput.value || 0);
    const receiverNameText = receiverName ? receiverName.textContent.trim() : 'Unknown Receiver';
    const receiverNumberText = receiverNumber ? receiverNumber.textContent.trim() : '';

    const authorized = window.confirm(
        `Do you authorize this transaction of ₹${amount.toLocaleString('en-IN')} to be stored and reviewed by the AI fraud system?`
    );

    if (!authorized) {
        alert('Transaction was not stored because authorization was not granted.');
        return false;
    }

    try {
        const api = window.AISecurePayAPI;
        if (!api || !api.getToken()) {
            alert('Please login again to complete this transaction.');
            window.location.href = 'mobile-verification.html';
            return false;
        }

        let deviceId = localStorage.getItem('securepayDeviceId');
        if (!deviceId) {
            deviceId = crypto.randomUUID();
            localStorage.setItem('securepayDeviceId', deviceId);
        }
        const localHour = new Date().getHours();

        const result = await api.request('/api/transactions', {
            method: 'POST',
            body: {
                amount,
                receiverName: receiverNameText,
                receiverNumber: receiverNumberText,
                note: 'AI verified transfer',
                transactionType: localStorage.getItem('receiverType') || 'transfer',
                authorized: true,
                stepUpToken,
                isNewDevice: false,
                isLateNight: false,
                isRepeatTransfer: false,
                receiverNotInContacts: false,
                hasRiskFlags: amount > 5000,
                nearDailyLimit: false,
                deviceId,
                clientHour: localHour,
            }
        });

        const transaction = result.transaction;
        const savedAt = new Date(transaction.created_at || Date.now());
        const history = JSON.parse(localStorage.getItem('transactionHistory') || '[]');
        history.unshift({
            id: transaction.id,
            type: 'Debit',
            amount: `₹${Number(transaction.amount).toLocaleString('en-IN')}`,
            receiverName: transaction.receiver_name,
            receiverNumber: transaction.receiver_number,
            transaction_type: transaction.transaction_type,
            status: result.risk.riskLevel === 'High' ? 'Suspicious' : 'Success',
            riskLevel: result.risk.riskLevel,
            riskScore: result.risk.riskScore,
            riskReasons: result.risk.reasons || [],
            date: `${savedAt.toLocaleDateString()}, ${savedAt.toLocaleTimeString()}`
        });
        localStorage.setItem('transactionHistory', JSON.stringify(history));

        if (result.risk.riskLevel === 'High') {
            const alerts = JSON.parse(localStorage.getItem('fraudAlerts') || '[]');
            alerts.unshift({
                id: `transaction-${transaction.id}`,
                title: 'High-risk transfer review',
                name: transaction.receiver_name,
                amount: `₹${Number(transaction.amount).toLocaleString('en-IN')}`,
                level: result.risk.riskLevel,
                reason: result.risk.reasons.join(', '),
                status: 'Pending',
                date: savedAt.toLocaleDateString(),
                time: savedAt.toLocaleTimeString()
            });
            localStorage.setItem('fraudAlerts', JSON.stringify(alerts));
        }

        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift({
            id: `transaction-${transaction.id}`,
            title: result.risk.riskLevel === 'High' ? 'Transfer flagged for review' : 'Demo transfer recorded',
            message: result.risk.riskLevel === 'High'
                ? `A ₹${Number(transaction.amount).toLocaleString('en-IN')} transfer to ${transaction.receiver_name} needs review.`
                : `A ₹${Number(transaction.amount).toLocaleString('en-IN')} demo transfer was recorded for risk review. No money moved.`,
            category: result.risk.riskLevel === 'High' ? 'security' : 'payment',
            icon: result.risk.riskLevel === 'High' ? 'fa-shield-halved' : 'fa-money-bill-transfer',
            type: result.risk.riskLevel === 'High' ? 'danger' : 'success',
            read: false,
            date: savedAt.toLocaleDateString(),
            time: savedAt.toLocaleTimeString()
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        alert(`Demo transfer recorded. Risk: ${result.risk.riskLevel} (${result.risk.riskScore}/100). No money moved.`);
        return true;
    } catch (error) {
        alert(error.message || 'Unable to save this transaction.');
        return false;
    }

}

successBtn.addEventListener("click", async()=>{

    successPopup.classList.remove("show");

    const saved = await saveTransactionToDatabase();

    if (!saved) {
        return;
    }

    // Clear selected receiver

    localStorage.removeItem("receiverName");
    localStorage.removeItem("receiverNumber");
    localStorage.removeItem("receiverAvatar");
    localStorage.removeItem("receiverType");
    localStorage.removeItem("qrAmount");
    stepUpToken = '';

    // Go back to Dashboard

    window.location.href="dashboard.html";

});

// ==========================================
// REPORT FRAUD
// ==========================================

const reportBtn=document.getElementById("reportBtn");

reportBtn.addEventListener("click",()=>{

    fraudPopup.classList.remove("show");

    freezePopup.classList.add("show");

});

// ==========================================
// CANCEL FRAUD POPUP
// ==========================================

const cancelBtn=document.getElementById("cancelBtn");

cancelBtn.addEventListener("click",()=>{

    fraudPopup.classList.remove("show");

});

// ==========================================
// TRANSACTION FROZEN
// ==========================================

const freezeDoneBtn=document.getElementById("freezeDoneBtn");

freezeDoneBtn.addEventListener("click",()=>{

    freezePopup.classList.remove("show");

    alert(
    `AI SecurePay Demo

The transfer simulation was cancelled.

No payment was sent to a bank and no funds moved.`
    );

    localStorage.removeItem("receiverName");
    localStorage.removeItem("receiverNumber");
    localStorage.removeItem("receiverAvatar");
    localStorage.removeItem("receiverType");
    localStorage.removeItem("qrAmount");

    window.location.href="dashboard.html";

});

// ==========================================
// CLOSE POPUP WHEN CLICKING OUTSIDE
// ==========================================

window.addEventListener("click",(e)=>{

    if(e.target===verifyPopup){

        verifyPopup.classList.remove("show");

    }

    if(e.target===successPopup){

        successPopup.classList.remove("show");

    }

    if(e.target===fraudPopup){

        fraudPopup.classList.remove("show");

    }

    if(e.target===freezePopup){

        freezePopup.classList.remove("show");

    }

});

// ==========================================
// BUTTON CLICK ANIMATION
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
// KEYBOARD SUPPORT
// ==========================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        continueBtn.click();

    }

    if(e.key==="Escape"){

        verifyPopup.classList.remove("show");
        successPopup.classList.remove("show");
        fraudPopup.classList.remove("show");
        freezePopup.classList.remove("show");

    }

});


// ==========================================
// END OF FILE
// ==========================================