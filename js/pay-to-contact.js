// ==========================================
// AI SecurePay - Pay to Contact
// ==========================================

// ==========================================
// PAGE LOAD ANIMATION
// ==========================================

window.addEventListener("load", () => {

    const container = document.querySelector(".container");

    if (container) {

        container.style.opacity = "0";
        container.style.transform = "translateY(25px)";

        setTimeout(() => {

            container.style.transition = ".6s ease";

            container.style.opacity = "1";

            container.style.transform = "translateY(0)";

        }, 200);

    }

});

// ==========================================
// BACK BUTTON
// ==========================================

const backBtn = document.querySelector(".back-btn");

if (backBtn) {

    backBtn.addEventListener("click", (e) => {

        e.preventDefault();

        window.location.href = "dashboard.html";

    });

}

// ==========================================
// HELP BUTTON
// ==========================================

const helpBtn = document.querySelector(".help-btn");

if (helpBtn) {

    helpBtn.addEventListener("click", () => {

        alert(

`Pay to Contact

• Select a contact.

• Enter payment amount.

• AI checks every transaction.

• Payments above ₹5000 require verification.`

        );

    });

}

// ==========================================
// VOICE SEARCH
// ==========================================

const voiceBtn = document.querySelector(".voice-btn");

if (voiceBtn) {

    voiceBtn.addEventListener("click", () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            searchInput?.focus();
            if (searchInput) searchInput.placeholder = 'Voice search is not supported here; type a name or number';
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.onresult = (event) => {
            searchInput.value = event.results[0][0].transcript;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        };
        recognition.onerror = () => {
            if (searchInput) searchInput.placeholder = 'Could not hear that. Type a name or number';
        };
        recognition.start();

    });

}

// ==========================================
// LIVE SEARCH
// ==========================================

const searchInput = document.getElementById("searchInput");

const contacts = document.querySelectorAll(".contact-card");

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        const value = searchInput.value.toLowerCase();

        contacts.forEach(contact => {

            const text = contact.innerText.toLowerCase();

            if (text.includes(value)) {

                contact.style.display = "flex";

            }

            else {

                contact.style.display = "none";

            }

        });

    });

}

// ==========================================
// SORT BUTTON
// ==========================================

const sortBtn = document.querySelector(".sort-btn");

if (sortBtn) {

    sortBtn.addEventListener("click", () => {
        const list = document.querySelector('.contact-list');
        if (!list) return;
        const sorted = sortBtn.dataset.sorted !== 'true';
        const cards = [...list.querySelectorAll('.contact-card')];
        cards.sort((a, b) => {
            const first = a.querySelector('.contact-details h3')?.textContent.trim() || '';
            const second = b.querySelector('.contact-details h3')?.textContent.trim() || '';
            return sorted ? first.localeCompare(second) : -first.localeCompare(second);
        });
        cards.forEach((card) => list.appendChild(card));
        sortBtn.dataset.sorted = String(sorted);
        sortBtn.setAttribute('aria-label', sorted ? 'Sort contacts Z to A' : 'Sort contacts A to Z');

    });

}
// ==========================================
// CONTACT CLICK
// ==========================================

const contactCards = document.querySelectorAll(".contact-card");

contactCards.forEach(card => {

    card.addEventListener("click", () => {

        // ===============================
        // Get Selected Contact Details
        // ===============================

        const name = card.querySelector(".contact-details h3").textContent.trim();

        const number = card.querySelector(".contact-details p").textContent.trim();

        const avatar = card.querySelector(".avatar").textContent.trim();

        // Save Receiver Details

        localStorage.setItem("receiverName", name);
        localStorage.setItem('receiverType', 'contact');

        localStorage.setItem("receiverNumber", number);

        localStorage.setItem("receiverAvatar", avatar);

        // Save Avatar Color

        let avatarColor = "blue";

        if(card.querySelector(".avatar").classList.contains("purple")){

            avatarColor = "purple";

        }

        else if(card.querySelector(".avatar").classList.contains("green")){

            avatarColor = "green";

        }

        else if(card.querySelector(".avatar").classList.contains("orange")){

            avatarColor = "orange";

        }

        else if(card.querySelector(".avatar").classList.contains("pink")){

            avatarColor = "pink";

        }

        else if(card.querySelector(".avatar").classList.contains("cyan")){

            avatarColor = "cyan";

        }

        localStorage.setItem("receiverColor", avatarColor);

        // Click Animation

        card.style.transform = "scale(.97)";

        setTimeout(() => {

            card.style.transform = "scale(1)";

            window.location.href = "enter-amount.html";

        },150);

    });

});

// ==========================================
// INVITE FRIENDS
// ==========================================

const inviteBtn = document.querySelector(".invite-btn");

if(inviteBtn){

    inviteBtn.addEventListener("click",()=>{

        alert(

`Invite Friends

Invite your friends to AI SecurePay

and enjoy secure AI-powered payments.`

        );

    });

}

// ==========================================
// AI SECURITY CARD
// ==========================================

const securityCard = document.querySelector(".security-card");

if(securityCard){

    securityCard.addEventListener("click",()=>{

        alert(

`AI Secure Payments

✔ AI Fraud Detection

✔ Device Verification

✔ Behaviour Analysis

✔ End-to-End Encryption

✔ Bank Level Security`

        );

    });

}
// ==========================================
// BOTTOM NAVIGATION
// ==========================================

const navLinks = document.querySelectorAll(".bottom-nav a");

navLinks.forEach(link => {

    link.addEventListener("click", function () {

        navLinks.forEach(item => {

            item.classList.remove("active");

        });

        this.classList.add("active");

    });

});

// ==========================================
// CARD HOVER EFFECT
// ==========================================

const cards = document.querySelectorAll(

".contact-card, .invite-card, .security-card"

);

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.boxShadow =

        "0 0 22px rgba(37,99,235,.35)";

        card.style.transform = "translateY(-2px)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.boxShadow = "";

        card.style.transform = "translateY(0)";

    });

});

// ==========================================
// AVATAR ANIMATION
// ==========================================

const avatars = document.querySelectorAll(".avatar");

avatars.forEach(avatar => {

    avatar.addEventListener("mouseenter", () => {

        avatar.style.transform = "scale(1.08) rotate(5deg)";

    });

    avatar.addEventListener("mouseleave", () => {

        avatar.style.transform = "scale(1) rotate(0deg)";

    });

});

// ==========================================
// PAGE EXIT ANIMATION
// ==========================================

window.addEventListener("beforeunload", () => {

    const container = document.querySelector(".container");

    if(container){

        container.style.opacity = "0";

    }

});

// ==========================================
// END OF FILE
// ==========================================