// ==========================================
// AI SecurePay - Chat
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
// GET USER DETAILS
// ==========================================

const userName=
localStorage.getItem("userName") || "Amit Sharma";

const userPhone=
localStorage.getItem("userPhone") || "+91 98765 43210";

const userAvatar=
localStorage.getItem("userAvatar") || "AS";

const userUpi=
localStorage.getItem("userUpi") || "amitsharma@oksbi";

// ==========================================
// UPDATE HEADER
// ==========================================

document.getElementById("userName").innerText=userName;

document.getElementById("userPhone").innerText=userPhone;

document.getElementById("userAvatar").innerText=userAvatar;

document.getElementById("callName").innerText=userName;

document.getElementById("callPhone").innerText=userPhone;

document.getElementById("callAvatar").innerText=userAvatar;

// ==========================================
// UPDATE CHAT USER NAME
// ==========================================

const dynamicNames=document.querySelectorAll(".dynamicName");

dynamicNames.forEach(name=>{

    name.innerText=userName;

});

const chatUser=document.getElementById("chatUser");

if(chatUser){

    chatUser.innerText=userName;

}

// ==========================================
// SELECT ELEMENTS
// ==========================================

const backBtn=document.querySelector(".back-btn");

const callBtn=document.querySelector(".call-btn");

const menuBtn=document.querySelector(".menu-btn");

const callModal=document.getElementById("callModal");

const popupMenu=document.getElementById("popupMenu");

const endCall=document.querySelector(".end-call");

const securityModal=document.getElementById("securityModal");

const securityBtn=document.getElementById("securityBtn");

const closeSecurity=document.getElementById("closeSecurity");

const payAgainBtn=document.getElementById("payAgainBtn");

const historyBtn=document.getElementById("historyBtn");

const sendBtn=document.querySelector(".send-btn");

const messageInput=document.getElementById("messageInput");

const chatSection=document.querySelector(".chat-section");
// ==========================================
// BACK BUTTON
// ==========================================

if(backBtn){

    backBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href="user-transactions.html";

    });

}

// ==========================================
// CALL POPUP
// ==========================================

if(callBtn){

    callBtn.addEventListener("click",()=>{

        callModal.style.display="flex";

    });

}

if(endCall){

    endCall.addEventListener("click",()=>{

        callModal.style.display="none";

    });

}

// Close popup by clicking outside

window.addEventListener("click",(e)=>{

    if(e.target===callModal){

        callModal.style.display="none";

    }

});

// ==========================================
// MORE MENU
// ==========================================

if(menuBtn){

    menuBtn.addEventListener("click",(e)=>{

        e.stopPropagation();

        if(popupMenu.style.display==="block"){

            popupMenu.style.display="none";

        }

        else{

            popupMenu.style.display="block";

        }

    });

}

// Hide menu when clicking outside

document.addEventListener("click",(e)=>{

    if(!popupMenu.contains(e.target) &&

       !menuBtn.contains(e.target)){

        popupMenu.style.display="none";

    }

});

// ==========================================
// SECURITY TIPS
// ==========================================

if(securityBtn){

    securityBtn.addEventListener("click",()=>{

        securityModal.style.display="flex";

    });

}

if(closeSecurity){

    closeSecurity.addEventListener("click",()=>{

        securityModal.style.display="none";

    });

}

window.addEventListener("click",(e)=>{

    if(e.target===securityModal){

        securityModal.style.display="none";

    }

});

// ==========================================
// PAY AGAIN
// ==========================================

if(payAgainBtn){

    payAgainBtn.addEventListener("click",()=>{

        localStorage.setItem("receiverName",userName);

        localStorage.setItem("receiverNumber",userPhone);

        localStorage.setItem("receiverAvatar",userAvatar);

        localStorage.setItem("receiverUpi",userUpi);

        window.location.href="enter-amount.html";

    });

}

// ==========================================
// VIEW HISTORY
// ==========================================

if(historyBtn){

    historyBtn.addEventListener("click",()=>{

        window.location.href="user-transactions.html";

    });

}
// ==========================================
// SEND MESSAGE
// ==========================================

function sendMessage(){

    const message = messageInput.value.trim();

    if(message==="") return;

    const messageRow = document.createElement("div");

    messageRow.className = "message-row sent";

    const now = new Date();

    const time = now.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

    messageRow.innerHTML = `

        <div class="message-bubble">

            <p>${message}</p>

            <span class="time">

                ${time}

                <i class="fa-solid fa-check-double"></i>

            </span>

        </div>

    `;

    chatSection.appendChild(messageRow);

    messageInput.value="";

    chatSection.scrollTop=chatSection.scrollHeight;

}

// ==========================================
// SEND BUTTON
// ==========================================

if(sendBtn){

    sendBtn.addEventListener("click",sendMessage);

}

// ==========================================
// PRESS ENTER TO SEND
// ==========================================

if(messageInput){

    messageInput.addEventListener("keypress",(e)=>{

        if(e.key==="Enter"){

            e.preventDefault();

            sendMessage();

        }

    });

}

// ==========================================
// EMOJI BUTTON
// ==========================================

const emojiBtn=document.querySelector(".emoji-btn");

if(emojiBtn){

    emojiBtn.addEventListener("click",()=>{

        messageInput.value += " 😊";

        messageInput.focus();

    });

}

// ==========================================
// ATTACHMENT BUTTON
// ==========================================

const attachBtn=document.querySelector(".attach-btn");

if(attachBtn){

    attachBtn.addEventListener("click",()=>{

        alert(

`Attachments

📷 Camera

🖼 Gallery

📄 Document

📍 Location

💳 Payment Request`

        );

    });

}

// ==========================================
// AUTO SCROLL
// ==========================================

chatSection.scrollTop = chatSection.scrollHeight;

// ==========================================
// CHAT CARD ANIMATION
// ==========================================

const bubbles=document.querySelectorAll(".message-bubble");

bubbles.forEach(bubble=>{

    bubble.addEventListener("mouseenter",()=>{

        bubble.style.transform="translateY(-2px)";

    });

    bubble.addEventListener("mouseleave",()=>{

        bubble.style.transform="translateY(0)";

    });

});
// ==========================================
// SPEAKER BUTTON
// ==========================================

const speakerBtn=document.querySelector(".speaker-btn");

if(speakerBtn){

    let speakerOn=true;

    speakerBtn.addEventListener("click",()=>{

        speakerOn=!speakerOn;

        if(speakerOn){

            speakerBtn.style.background="#2563EB";

            alert("Speaker Enabled");

        }

        else{

            speakerBtn.style.background="#374151";

            alert("Speaker Disabled");

        }

    });

}

// ==========================================
// MUTE BUTTON
// ==========================================

const muteBtn=document.querySelector(".mute-btn");

if(muteBtn){

    let muted=false;

    muteBtn.addEventListener("click",()=>{

        muted=!muted;

        if(muted){

            muteBtn.style.background="#EF4444";

            alert("Microphone Muted");

        }

        else{

            muteBtn.style.background="#F59E0B";

            alert("Microphone Unmuted");

        }

    });

}

// ==========================================
// POPUP MENU OPTIONS
// ==========================================

const profileOption=document.querySelector(".profile-option");

const settingsOption=document.querySelector(".settings-option");

const blockOption=document.querySelector(".block-option");

const exportOption=document.querySelector(".export-option");

const clearOption=document.querySelector(".clear-option");

if(profileOption){

    profileOption.addEventListener("click",()=>{

        alert(

`Profile

Name : ${userName}

Phone : ${userPhone}

UPI : ${userUpi}

AI SecurePay Verified`

        );

    });

}

if(settingsOption){

    settingsOption.addEventListener("click",()=>{

        alert(

`Chat Settings

• Notifications

• Wallpaper

• Font Size

• Privacy

• Security`

        );

    });

}

if(blockOption){

    blockOption.addEventListener("click",()=>{

        const confirmBlock=confirm(

            `Block ${userName}?`

        );

        if(confirmBlock){

            alert(userName+" has been blocked.");

        }

    });

}

if(exportOption){

    exportOption.addEventListener("click",()=>{

        alert(

`Export Chat

Preparing chat history...

Download will be available soon.`

        );

    });

}

if(clearOption){

    clearOption.addEventListener("click",()=>{

        const confirmClear=confirm(

            "Clear this chat?"

        );

        if(confirmClear){

            alert("Chat cleared successfully.");

        }

    });

}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        popupMenu.style.display="none";

        callModal.style.display="none";

        securityModal.style.display="none";

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
// PAGE READY
// ==========================================

console.log("AI SecurePay Chat Loaded Successfully");

// ==========================================
// END OF FILE
// ==========================================