// ==========================================
// AI SecurePay - Payment Options
// ==========================================

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load", () => {

    const container = document.querySelector(".container");

    if(container){

        container.style.opacity="0";

        container.style.transform="translateY(25px)";

        setTimeout(()=>{

            container.style.transition=".6s ease";

            container.style.opacity="1";

            container.style.transform="translateY(0)";

        },200);

    }

});

// ==========================================
// TAB SWITCHING
// ==========================================

const scanTab=document.getElementById("scanTab");

const myQRTab=document.getElementById("myQRTab");

if(scanTab && myQRTab){

    scanTab.addEventListener("click",()=>{

        scanTab.classList.add("active");

        myQRTab.classList.remove("active");

        document.getElementById('qrStatus').textContent = 'Choose a QR image or use your camera to scan a UPI payment code.';

    });

    myQRTab.addEventListener("click",()=>{

        window.location.href="my-qr.html";

    });

}

// ==========================================
// QR SCANNER ANIMATION
// ==========================================

const scanner=document.querySelector(".scan-line");

if(scanner){

    scanner.style.animation="scanner 2.5s linear infinite";

}
// ==========================================
// QR SCAN SIMULATION
// ==========================================

const sampleQr = document.getElementById('sampleQr');
const qrFile = document.getElementById('qrFile');
const qrStatus = document.getElementById('qrStatus');
const startCamera = document.getElementById('startCamera');
const qrReader = document.getElementById('qrReader');

async function acceptSecurePayCode(decodedText) {
    if (!String(decodedText).startsWith('securepay://pay?')) {
        qrStatus.textContent = 'QR rejected. Only signed SecurePay account codes are accepted.';
        return;
    }

    try {
        const result = await window.AISecurePayAPI.request('/api/qr/verify', {
            method: 'POST',
            body: { qrData: decodedText },
        });
        const recipient = result.recipient;
        localStorage.setItem('receiverType', 'scan');
        localStorage.setItem('receiverName', recipient.name);
        localStorage.setItem('receiverNumber', recipient.paymentId);
        localStorage.setItem('receiverAvatar', recipient.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase());
        localStorage.removeItem('qrAmount');
        window.location.href = 'enter-amount.html';
    } catch (error) {
        qrStatus.textContent = error.message || 'QR rejected. SecurePay could not verify its signature.';
    }
}

if (qrFile) {
    qrFile.addEventListener('change', async () => {
        const file = qrFile.files?.[0];
        if (!file) return;
        if (typeof Html5Qrcode === 'undefined') {
            qrStatus.textContent = 'QR scanner could not load. Refresh the page and try again.';
            return;
        }
        qrReader.hidden = false;
        const decoder = new Html5Qrcode('qrReader');
        qrStatus.textContent = 'Reading QR image...';
        try {
            await acceptSecurePayCode(await decoder.scanFile(file, false));
        } catch (error) {
            qrStatus.textContent = 'No readable QR code was found in that image.';
        } finally {
            decoder.clear();
            qrReader.hidden = true;
            qrFile.value = '';
        }
    });
}

if (startCamera) {
    startCamera.addEventListener('click', async () => {
        if (typeof Html5Qrcode === 'undefined') {
            qrStatus.textContent = 'QR scanner could not load. Refresh the page and try again.';
            return;
        }
        qrReader.hidden = false;
        const scanner = new Html5Qrcode('qrReader');
        startCamera.disabled = true;
        qrStatus.textContent = 'Allow camera access to scan a signed SecurePay QR code.';
        try {
            await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 240 }, async (text) => {
                await scanner.stop();
                await acceptSecurePayCode(text);
            });
            qrStatus.textContent = 'Camera ready. Hold a SecurePay QR code inside the frame.';
        } catch (error) {
            qrReader.hidden = true;
            qrStatus.textContent = 'Camera is unavailable. Choose a QR image instead.';
        } finally {
            startCamera.disabled = false;
        }
    });
}

// ==========================================
// SECURITY CARD
// ==========================================

const securityCard=document.querySelector(".security-card");

if(securityCard){

    securityCard.addEventListener("click",()=>{

        if (qrStatus) qrStatus.textContent = 'Transfers are recorded to your account and reviewed by the configured risk checks. This demo does not move real money.';

    });

}

// ==========================================
// RECENT PAYEES
// ==========================================

const payees=document.querySelectorAll(".payee-card");

payees.forEach(payee=>{

    payee.addEventListener("click",()=>{

        const name=payee.querySelector("h4").innerText;

        if(name==="Add New"){

            window.location.href = "pay-to-contact.html";

            return;

        }

        const avatar=payee.querySelector(".avatar").innerText;

        const number=payee.querySelector("p").innerText;

        // Save Receiver

        localStorage.setItem("receiverName",name);
        localStorage.setItem('receiverType', 'contact');

        localStorage.setItem("receiverNumber",number);

        localStorage.setItem("receiverAvatar",avatar);

        let color="blue";

        if(payee.querySelector(".avatar").classList.contains("purple")){

            color="purple";

        }

        else if(payee.querySelector(".avatar").classList.contains("green")){

            color="green";

        }

        else if(payee.querySelector(".avatar").classList.contains("orange")){

            color="orange";

        }

        localStorage.setItem("receiverColor",color);

        window.location.href="enter-amount.html";

    });

});
// ==========================================
// UPI PAYMENT
// ==========================================

const upiCard = document.getElementById("upiPayment");

if(upiCard){

    upiCard.addEventListener("click",()=>{

        const upiId = prompt("Enter the recipient UPI ID");
        if (!upiId || !upiId.includes('@')) return;
        localStorage.setItem('receiverName', upiId.split('@')[0]);
        localStorage.setItem('receiverType', 'contact');
        localStorage.setItem('receiverNumber', upiId.trim());
        window.location.href = 'enter-amount.html';

    });

}

// ==========================================
// QUICK PAYMENT BUTTONS
// ==========================================

const quickButtons=document.querySelectorAll(".quick-btn");

quickButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        const text=button.innerText;

        if(text.includes("Mobile")){

            window.location.href = "pay-to-contact.html";

        }

        else if(text.includes("Bank")){

            window.location.href = "pay-to-bank.html";

        }

        else{

            window.location.href = "self-account.html";

        }

    });

});

// ==========================================
// BACK BUTTON
// ==========================================

const backButton=document.querySelector(".back-btn");

if(backButton){

    backButton.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="dashboard.html";

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

const cards = document.querySelectorAll(
".payee-card, .step-card, .security-card, .quick-btn"
);

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        card.style.transform="scale(.96)";

        setTimeout(()=>{

            card.style.transform="scale(1)";

        },150);

    });

});

// ==========================================
// CARD HOVER EFFECT
// ==========================================

cards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 20px rgba(37,99,235,.35)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});

// ==========================================
// QR IMAGE HOVER
// ==========================================

if(sampleQr){

    sampleQr.addEventListener("mouseenter",()=>{

        sampleQr.style.transform="scale(1.03)";

    });

    sampleQr.addEventListener("mouseleave",()=>{

        sampleQr.style.transform="scale(1)";

    });

}

// ==========================================
// PAGE EXIT ANIMATION
// ==========================================

window.addEventListener("beforeunload",()=>{

    const container=document.querySelector(".container");

    if(container){

        container.style.opacity="0";

    }

});

// ==========================================
// CLEAR OLD RECEIVER (OPTIONAL)
// ==========================================

window.addEventListener("pageshow",()=>{

    // Uncomment these lines only if you want to
    // clear the last receiver every time this page opens.

    /*
    localStorage.removeItem("receiverName");
    localStorage.removeItem("receiverNumber");
    localStorage.removeItem("receiverAvatar");
    localStorage.removeItem("receiverColor");
    */

});

// ==========================================
// END OF FILE
// ==========================================