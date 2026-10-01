// ==========================================
// AI SecurePay - User Transactions
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
// GET USER DETAILS FROM LOCAL STORAGE
// ==========================================

const userName =
localStorage.getItem("userName") || "Amit Sharma";

const userPhone =
localStorage.getItem("userPhone") || "+91 98765 43210";

const userAvatar =
localStorage.getItem("userAvatar") || "AS";

const userUpi =
localStorage.getItem("userUpi") || "amitsharma@oksbi";

// ==========================================
// UPDATE PROFILE
// ==========================================

document.getElementById("userName").innerText=userName;

document.getElementById("pageUserName").innerText=userName;

document.getElementById("userPhone").innerText=userPhone;

document.getElementById("userAvatar").innerText=userAvatar;

document.getElementById("paidName").innerText=userName;

document.getElementById("receivedName").innerText=userName;

document.getElementById("bottomUserName").innerText=userName;

// ==========================================
// UPDATE ALL TRANSACTION NAMES
// ==========================================

const names=document.querySelectorAll(".dynamicName");

names.forEach(name=>{

    name.innerText=userName;

});

// ==========================================
// UPDATE ALL UPI IDs
// ==========================================

document.getElementById("dynamicUpi1").innerText=
"UPI ID : "+userUpi;

document.getElementById("dynamicUpi2").innerText=
"UPI ID : "+userUpi;

document.getElementById("dynamicUpi3").innerText=
"UPI ID : "+userUpi;

document.getElementById("dynamicUpi4").innerText=
"UPI ID : "+userUpi;

document.getElementById("dynamicUpi5").innerText=
"UPI ID : "+userUpi;

document.getElementById("dynamicUpi6").innerText=
"UPI ID : "+userUpi;

// ==========================================
// BUTTONS
// ==========================================

const backBtn=document.querySelector(".back-btn");

const chatBtn=document.querySelector(".chat-btn");

const payAgainBtn=document.querySelector(".payagain-btn");

const enterAmountBtn=document.getElementById("enterAmountBtn");
// ==========================================
// BACK BUTTON
// ==========================================

if(backBtn){

    backBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="transaction-history.html";

    });

}

// ==========================================
// CHAT BUTTON
// ==========================================

// ==========================================
// CHAT BUTTON
// ==========================================

if(chatBtn){

    chatBtn.addEventListener("click",()=>{

        // Save user details for Chat Page

        localStorage.setItem("userName",userName);

        localStorage.setItem("userPhone",userPhone);

        localStorage.setItem("userAvatar",userAvatar);

        localStorage.setItem("userUpi",userUpi);

        // Open Chat Page

        window.location.href="chat.html";

    });

}

// ==========================================
// PAY AGAIN BUTTON
// ==========================================

if(payAgainBtn){

    payAgainBtn.addEventListener("click",()=>{

        // Save Receiver Details

        localStorage.setItem("receiverName",userName);

        localStorage.setItem("receiverNumber",userPhone);

        localStorage.setItem("receiverAvatar",userAvatar);

        localStorage.setItem("receiverUpi",userUpi);

        localStorage.setItem("receiverColor","blue");

        // Open Enter Amount Page

        window.location.href="enter-amount.html";

    });

}

// ==========================================
// ENTER AMOUNT BUTTON
// ==========================================

if(enterAmountBtn){

    enterAmountBtn.addEventListener("click",()=>{

        // Save Receiver Details

        localStorage.setItem("receiverName",userName);

        localStorage.setItem("receiverNumber",userPhone);

        localStorage.setItem("receiverAvatar",userAvatar);

        localStorage.setItem("receiverUpi",userUpi);

        localStorage.setItem("receiverColor","blue");

        // Open Enter Amount Page

        window.location.href="enter-amount.html";

    });

}

// ==========================================
// TRANSACTION CARD CLICK
// ==========================================

const transactionCards=document.querySelectorAll(".transaction-card");

transactionCards.forEach(card=>{

    card.addEventListener("click",()=>{

        card.style.transform="scale(.98)";

        setTimeout(()=>{

            card.style.transform="scale(1)";

        },150);

    });

});
// ==========================================
// MORE MENU
// ==========================================

const moreBtn = document.querySelector(".more-btn");

if(moreBtn){

    moreBtn.addEventListener("click",()=>{

        alert(

`AI SecurePay

👤 View Profile

📄 Download Statement

⭐ Favourite Contact

🚫 Block Contact

⚙ Payment Settings`

        );

    });

}

// ==========================================
// SUMMARY CARDS
// ==========================================

const summaryCards=document.querySelectorAll(".summary-box");

summaryCards.forEach(card=>{

    card.addEventListener("click",()=>{

        const title=card.querySelector("p").innerText;

        alert(

`${title}

Transaction analytics

generated by

AI SecurePay.`

        );

    });

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
// BUTTON CLICK ANIMATION
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
// PROFILE CARD HOVER
// ==========================================

const profileCard=document.querySelector(".profile-card");

if(profileCard){

    profileCard.addEventListener("mouseenter",()=>{

        profileCard.style.boxShadow="0 0 25px rgba(37,99,235,.35)";

    });

    profileCard.addEventListener("mouseleave",()=>{

        profileCard.style.boxShadow="";

    });

}

// ==========================================
// SUMMARY CARD HOVER
// ==========================================

summaryCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 18px rgba(37,99,235,.30)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});
// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown",(e)=>{

    // Back to Transaction History

    if(e.key==="Escape"){

        window.location.href="transaction-history.html";

    }

    // Pay Again using Enter

    if(e.key==="Enter"){

        if(document.activeElement.tagName!=="INPUT"){

            payAgainBtn.click();

        }

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
// TRANSACTION CARD HOVER EFFECT
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
// AVATAR ANIMATION
// ==========================================

const avatar=document.getElementById("userAvatar");

if(avatar){

    avatar.addEventListener("mouseenter",()=>{

        avatar.style.transform="scale(1.08) rotate(5deg)";

    });

    avatar.addEventListener("mouseleave",()=>{

        avatar.style.transform="scale(1) rotate(0deg)";

    });

}

// ==========================================
// PAY BUTTON GLOW EFFECT
// ==========================================

const payButton=document.querySelector(".pay-button");

if(payButton){

    payButton.addEventListener("mouseenter",()=>{

        payButton.style.boxShadow="0 0 30px rgba(37,99,235,.45)";

    });

    payButton.addEventListener("mouseleave",()=>{

        payButton.style.boxShadow="";

    });

}

// ==========================================
// PAGE READY
// ==========================================

console.log("AI SecurePay - User Transactions Loaded Successfully");

// ==========================================
// END OF FILE
// ==========================================