// ========================================
// AI Fraud Detection App
// Link Your Bank
// bank.js
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    // ----------------------------
    // Back Button
    // ----------------------------

    const backBtn = document.getElementById("backBtn");

    if (backBtn) {

        backBtn.addEventListener("click", function () {

            window.location.href = "dashboard.html";

        });

    }

    // ----------------------------
    // Search Bank
    // ----------------------------

    const searchInput = document.getElementById("searchBank");

    const bankCards = document.querySelectorAll(".bank-card");

    if (searchInput) {

        searchInput.addEventListener("keyup", function () {

            const value = this.value.toLowerCase();

            bankCards.forEach(function (card) {

                const bankName = card.innerText.toLowerCase();

                if (bankName.includes(value)) {

                    card.style.display = "flex";

                } else {

                    card.style.display = "none";

                }

            });

        });

    }

    // ----------------------------
    // Popup
    // ----------------------------

    const popup = document.getElementById("popup");

    // ----------------------------
    // Bank Selection
    // ----------------------------

    bankCards.forEach(function (card) {

        card.addEventListener("click", function () {
            const selectedName = this.querySelector('span')?.textContent.trim();
            if (selectedName) localStorage.setItem('securepayDemoBank', selectedName);

            // Remove previous selection

            bankCards.forEach(function (item) {

                item.style.border = "1px solid rgba(255,255,255,.12)";
                item.style.background = "rgba(255,255,255,.08)";

            });

            // Highlight selected bank

            this.style.border = "2px solid #42A5F5";
            this.style.background = "#123C82";

            // Show popup

            if (popup) {

                popup.style.display = "flex";

            }

            // Redirect after 2 seconds

            setTimeout(function () {

                window.location.href = "dashboard.html";

            }, 2000);

        });

    });

    // ----------------------------
    // More Banks
    // ----------------------------

    const moreBank = document.querySelector(".more-bank-card");

    if (moreBank) {

        moreBank.addEventListener("click", function () {

            document.querySelector('.bank-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        });

    }

});