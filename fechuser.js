// Import Firestore Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const db = getFirestore(app);

// Function to sanitize input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// Function to show messages
function showMessage(message, container) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = message;
    messageDiv.style.color = "#e74c3c";
    container.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Function to Fetch Users from Firestore
async function fetchUsers() {
    const userList = document.getElementById("userList");
    if (!userList) {
        console.error("userList element not found");
        return;
    }

    userList.innerHTML = "<li>Loading users...</li>";
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        userList.innerHTML = "";
        if (querySnapshot.empty) {
            userList.innerHTML = "<li>No users found.</li>";
            return;
        }
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            const userItem = document.createElement("li");
            userItem.innerHTML = `Name: ${sanitizeInput(userData.username || "N/A")}, Email: ${sanitizeInput(userData.email || "N/A")}, Phone: ${sanitizeInput(userData.phone || "N/A")}`;
            userList.appendChild(userItem);
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        userList.innerHTML = "";
        showMessage("Failed to fetch users. Please try again later.", userList);
    }
}

// Call the function when the page loads
document.addEventListener("DOMContentLoaded", fetchUsers);