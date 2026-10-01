// ==========================================
// AI SecurePay - Pay to Bank
// ==========================================

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load", () => {

    const container = document.querySelector(".container");

    if(container){

        container.style.opacity = "0";

        container.style.transform = "translateY(25px)";

        setTimeout(()=>{

            container.style.transition = ".6s ease";

            container.style.opacity = "1";

            container.style.transform = "translateY(0)";

        },200);

    }

});

// ==========================================
// BACK BUTTON
// ==========================================

const backBtn = document.querySelector(".back-btn");

if(backBtn){

    backBtn.addEventListener("click",(e)=>{

        e.preventDefault();

        window.location.href = "dashboard.html";

    });

}

// ==========================================
// BANK SELECTION
// ==========================================

const bankCards = document.querySelectorAll(".bank-card");

let selectedBank = "SBI";

bankCards.forEach(card=>{

    card.addEventListener("click",()=>{

        bankCards.forEach(item=>{

            item.classList.remove("active");

        });

        card.classList.add("active");

        selectedBank = card.querySelector("h3").innerText;

    });

});

// ==========================================
// SEARCH BANK
// ==========================================

const bankSearch = document.getElementById("bankSearch");

if(bankSearch){

    bankSearch.addEventListener("keyup",()=>{

        const value = bankSearch.value.toLowerCase();

        bankCards.forEach(card=>{

            const bankName = card.innerText.toLowerCase();

            if(bankName.includes(value)){

                card.style.display = "block";

            }

            else{

                card.style.display = "none";

            }

        });

    });

}

// ==========================================
// FIND IFSC
// ==========================================

const ifscBtn = document.querySelector(".ifsc-btn");

const ifscInput = document.getElementById("ifscCode");

if(ifscBtn){

    ifscBtn.addEventListener("click",()=>{

        if(ifscInput.value.trim()===""){

            alert("Please enter an IFSC Code.");

            return;

        }

        alert("✔ IFSC Code Verified Successfully");

    });

}

// ==========================================
// FORM INPUTS
// ==========================================

const holderName = document.getElementById("holderName");

const accountNumber = document.getElementById("accountNumber");

const confirmAccount = document.getElementById("confirmAccount");

const amountInput = document.getElementById("bankAmount");

const continueBtn = document.getElementById("continueBtn");
// ==========================================
// CONTINUE BUTTON
// ==========================================

if(continueBtn){

continueBtn.addEventListener("click",()=>{

    // Get Values

    const name = holderName.value.trim();

    const account = accountNumber.value.trim();

    const confirm = confirmAccount.value.trim();

    const ifsc = ifscInput.value.trim();

    const amount = amountInput.value.trim();

    // ===============================
    // VALIDATION
    // ===============================

    if(name===""){

        alert("Please enter the Account Holder Name.");

        holderName.focus();

        return;

    }

    if(account===""){

        alert("Please enter the Account Number.");

        accountNumber.focus();

        return;

    }

    if(confirm===""){

        alert("Please re-enter the Account Number.");

        confirmAccount.focus();

        return;

    }

    if(account!==confirm){

        alert("Account Numbers do not match.");

        confirmAccount.focus();

        return;

    }

    if(ifsc===""){

        alert("Please enter the IFSC Code.");

        ifscInput.focus();

        return;

    }

    if(amount===""){

        alert("Please enter the Amount.");

        amountInput.focus();

        return;

    }

    // ===============================
    // CREATE AVATAR
    // ===============================

    let avatar = "";

    const words = name.split(" ");

    if(words.length>=2){

        avatar =
        words[0].charAt(0).toUpperCase() +
        words[1].charAt(0).toUpperCase();

    }

    else{

        avatar = name.substring(0,2).toUpperCase();

    }

    // ===============================
    // SAVE DETAILS
    // ===============================

    localStorage.setItem("receiverName",name);
    localStorage.setItem('receiverType', 'bank');

    localStorage.setItem("receiverNumber",

        "A/C ••••" + account.slice(-4)

    );

    localStorage.setItem("receiverAvatar",avatar);

    localStorage.setItem("receiverColor","green");

    localStorage.setItem("receiverBank",selectedBank);

    localStorage.setItem("receiverIFSC",ifsc);

    localStorage.setItem("paymentAmount",amount);

    // ==================================
    // OPEN ENTER AMOUNT PAGE
    // ==================================

    window.location.href="enter-amount.html";

});

}
// ==========================================
// AUTO UPPERCASE IFSC
// ==========================================

if(ifscInput){

    ifscInput.addEventListener("input",()=>{

        ifscInput.value = ifscInput.value.toUpperCase();

    });

}

// ==========================================
// ACCOUNT NUMBER VALIDATION
// ==========================================

accountNumber.addEventListener("input",()=>{

    accountNumber.value = accountNumber.value.replace(/\D/g,"");

});

confirmAccount.addEventListener("input",()=>{

    confirmAccount.value = confirmAccount.value.replace(/\D/g,"");

});

// ==========================================
// AMOUNT VALIDATION
// ==========================================

amountInput.addEventListener("input",()=>{

    amountInput.value = amountInput.value.replace(/[^0-9.]/g,"");

});

// ==========================================
// BUTTON CLICK ANIMATION
// ==========================================

const buttons = document.querySelectorAll("button");

buttons.forEach(button=>{

    button.addEventListener("click",()=>{

        button.style.transform="scale(.96)";

        setTimeout(()=>{

            button.style.transform="scale(1)";

        },120);

    });

});

// ==========================================
// CARD HOVER EFFECT
// ==========================================

bankCards.forEach(card=>{

    card.addEventListener("mouseenter",()=>{

        card.style.boxShadow="0 0 20px rgba(37,99,235,.35)";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.boxShadow="";

    });

});

// ==========================================
// ENTER KEY SUPPORT
// ==========================================

document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        continueBtn.click();

    }

});

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
// END OF FILE
// ==========================================