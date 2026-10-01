// ===============================
// AI FRAUD DETECTION APP
// main.js
// ===============================

// Wait until the page is loaded
document.addEventListener("DOMContentLoaded", function () {

    // Get Started Button
    const startBtn = document.getElementById("startBtn");

    if (startBtn) {

        startBtn.addEventListener("click", function () {

            // Button animation
            startBtn.innerHTML = "Loading...";

            startBtn.style.opacity = "0.8";

            // Start with customer account registration.
            setTimeout(function () {

                window.location.href = "signup.html";

            }, 600);

        });

    }

});