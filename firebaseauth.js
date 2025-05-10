import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlvkOICz_A5o-gNxuGE-X8w6P113-QBTU",
    authDomain: "diaries-of-kitchen-6638d.firebaseapp.com",
    projectId: "diaries-of-kitchen-6638d",
    storageBucket: "diaries-of-kitchen-6638d.firebasestorage.app",
    messagingSenderId: "69334070886",
    appId: "1:69334070886:web:461fc15ea48bed8f9cdfa7",
    measurementId: "G-9SH04G5KDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to show messages
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    if (messageDiv) {
        messageDiv.style.display = "block";
        messageDiv.innerHTML = message;
        messageDiv.style.opacity = 1;
        setTimeout(() => {
            messageDiv.style.opacity = 0;
            setTimeout(() => {
                messageDiv.style.display = "none";
            }, 500);
        }, 5000);
    } else {
        console.warn(`Message div with ID ${divId} not found.`);
    }
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to log in user with email/password
export async function loginUser(email, password) {
    if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address.", "loginMessage");
        return;
    }
    if (!password) {
        showMessage("Please enter a password.", "loginMessage");
        return;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            console.log("User Data:", userDoc.data());
            showMessage("Login successful!", "loginMessage");

            setTimeout(() => {
                window.location.href = "index.html"; // Redirect to dashboard
            }, 2000);
        } else {
            showMessage("User not found in database!", "loginMessage");
        }
    } catch (error) {
        showMessage(`Login failed: ${error.message}`, "loginMessage");
    }
}

// Function for Google Login using Redirect
export async function googleLogin() {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
    } catch (error) {
        console.error("Google Login failed:", error);
        showMessage(`Google Login failed: ${error.message}`, "loginMessage");
    }
}

// Function to handle redirect result after Google login
export async function handleRedirect() {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                const validatedData = {
                    name: user.displayName || "Unknown",
                    email: user.email || "",
                    phone: user.phoneNumber || "",
                    state: "",
                    district: ""
                };
                await setDoc(doc(db, "users", user.uid), validatedData);
            }

            console.log("Google Login Successful:", user);
            showMessage("Google Login successful!", "loginMessage");

            setTimeout(() => {
                window.location.href = "index.html"; // Redirect to dashboard
            }, 2000);
        }
    } catch (error) {
        console.error("Error handling redirect result:", error);
        showMessage(`Error handling redirect: ${error.message}`, "loginMessage");
    }
}

// Function to reset password
export async function resetPassword(email) {
    if (!isValidEmail(email)) {
        showMessage("Please enter a valid email address.", "loginMessage");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        showMessage("Password reset email sent!", "loginMessage");
    } catch (error) {
        showMessage(`Error: ${error.message}`, "loginMessage");
    }
}

// Attach Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const googleLoginButton = document.getElementById("google-login-btn");
    const forgotPasswordLink = document.getElementById("forgot-password");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value.trim();
            await loginUser(email, password);
        });
    }

    if (googleLoginButton) {
        googleLoginButton.addEventListener("click", async () => {
            await googleLogin();
        });
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (event) => {
            event.preventDefault();
            const modal = document.getElementById("forgotPasswordModal");
            if (modal) {
                modal.style.display = "flex";
            }
        });
    }

    const sendOtpBtn = document.getElementById("sendOtpBtn");
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener("click", async () => {
            const email = document.getElementById("email").value.trim();
            await resetPassword(email);
        });
    }

    const closeModal = document.getElementById("closeModal");
    if (closeModal) {
        closeModal.addEventListener("click", () => {
            const modal = document.getElementById("forgotPasswordModal");
            if (modal) {
                modal.style.display = "none";
            }
        });
    }

    handleRedirect(); // Handle Google login redirect after page reload
});