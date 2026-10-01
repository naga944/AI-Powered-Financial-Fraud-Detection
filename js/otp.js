// ==========================================
// AI FRAUD DETECTION
// Mobile Verification
// otp.js
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        const message = document.getElementById('loginMessage');
        const submit = signInForm.querySelector('button[type="submit"]');
        const api = window.AISecurePayAPI;
        signInForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            message.textContent = '';
            submit.disabled = true;
            submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in';
            try {
                const result = await api.request('/api/auth/login', {
                    method: 'POST',
                    body: {
                        phone: document.getElementById('loginPhone').value.trim(),
                        password: document.getElementById('loginPassword').value,
                    },
                });
                api.saveAuth(result.token, result.user);
                window.location.href = 'dashboard.html';
            } catch (error) {
                message.textContent = error.message || 'Unable to sign in. Check your details and try again.';
                submit.disabled = false;
                submit.innerHTML = '<span>Sign in securely</span><i class="fa-solid fa-arrow-right"></i>';
            }
        });
        return;
    }

    const sendOtpBtn = document.getElementById("sendOtp");
    const verifyBtn = document.getElementById("verifyBtn");
    const scrollBtn = document.getElementById("scrollBtn");
    const otpSection = document.getElementById("otpSection");
    const mobileInput = document.querySelector(".mobile-box input");
    const otpInputs = document.querySelectorAll(".otp-box input");
    const api = window.AISecurePayAPI;

    function buildUserPayload(mobile) {
        return {
            name: "Demo User",
            email: `user${mobile}@securepay.app`,
            phone: `+91${mobile}`,
            password: "SecurePay@123"
        };
    }

    function setOtpStatus(button, label, disabledState) {
        button.innerHTML = label;
        button.disabled = disabledState;
    }

    scrollBtn.addEventListener("click", function () {
        otpSection.scrollIntoView({ behavior: "smooth" });
    });

    sendOtpBtn.addEventListener("click", async function () {
        let mobile = mobileInput.value.trim();

        if (mobile.length != 10 || isNaN(mobile)) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        const userPayload = buildUserPayload(mobile);

        setOtpStatus(sendOtpBtn, '<i class="fa-solid fa-spinner fa-spin"></i> Sending OTP...', true);

        try {
            const loginAttempt = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
            });

            if (!loginAttempt.ok) {
                const signupAttempt = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userPayload)
                });

                const signupResult = await signupAttempt.json();
                if (!signupAttempt.ok) {
                    throw new Error(signupResult.message || 'Unable to create account.');
                }
            }

            alert("OTP Sent Successfully!");
            setOtpStatus(sendOtpBtn, '<i class="fa-solid fa-circle-check"></i> OTP Sent', false);
            otpSection.scrollIntoView({ behavior: "smooth" });
        } catch (error) {
            alert(error.message || 'Could not process mobile verification.');
            setOtpStatus(sendOtpBtn, '<i class="fa-regular fa-paper-plane"></i> Send OTP', false);
        }
    });

    otpInputs.forEach((input, index) => {
        input.addEventListener("input", function () {
            if (this.value.length == 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", function (e) {
            if (e.key === "Backspace" && this.value === "" && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    verifyBtn.addEventListener("click", async function () {
        let otp = "";

        otpInputs.forEach(function (box) {
            otp += box.value;
        });

        if (otp.length != 6) {
            alert("Please enter the 6-digit OTP.");
            return;
        }

        const mobile = mobileInput.value.trim();
        const userPayload = buildUserPayload(mobile);

        verifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
        verifyBtn.disabled = true;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userPayload.email, password: userPayload.password })
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Verification failed.');
            }

            if (api && api.saveAuth) {
                api.saveAuth(result.token, result.user);
            }

            alert("Mobile Number Verified Successfully!");
            window.location.href = "link-bank.html";
        } catch (error) {
            alert(error.message || 'Verification failed.');
            verifyBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Verify & Continue';
            verifyBtn.disabled = false;
        }
    });

});