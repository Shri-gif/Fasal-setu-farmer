/* =========================================================
   KHET2GHAR FARMER SITE
   app.js
   Supabase Authentication + Common Helper Functions
   ========================================================= */

import { supabase } from "./supabase.js";

/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    await checkAuth();
    setupLogin();
    setupSignup();
    setupLogout();
});

/* =========================================================
   AUTHENTICATION CHECK
========================================================= */

async function checkAuth() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentPage = window.location.pathname.split("/").pop() || "index.html";

        const protectedPages = [
            "dashboard.html",
            "products.html",
            "add-product.html",
            "orders.html",
            "earning.html",
            "earnings.html",
            "profile.html"
        ];

        // User is not logged in
        if (!session) {
            if (protectedPages.includes(currentPage)) {
                window.location.replace("index.html");
                return;
            }
        }

        // User is already logged in
        if (session && (currentPage === "" || currentPage === "index.html")) {
            window.location.replace("dashboard.html");
            return;
        }
    } catch (err) {
        console.warn("Auth check error:", err);
    }
}

/* =========================================================
   LOGIN
========================================================= */

function setupLogin() {
    const loginForm = document.getElementById("farmerLoginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;
        const loginBtn = document.getElementById("loginBtn");

        if (!email || !password) {
            showLoginMessage("Please enter email and password.", "error");
            return;
        }

        if (loginBtn) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = "Logging in...";
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error("Login error:", error);
            showLoginMessage(getAuthErrorMessage(error), "error");
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = `Login to Farmer Dashboard <span>→</span>`;
            }
            return;
        }

        if (data.session) {
            showLoginMessage("Login successful. Opening dashboard...", "success");
            setTimeout(() => {
                window.location.replace("dashboard.html");
            }, 500);
        }
    });
}

/* =========================================================
   SIGNUP
========================================================= */

function setupSignup() {
    const signupBtn = document.getElementById("signupBtn");
    if (!signupBtn) return;

    signupBtn.addEventListener("click", async () => {
        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;

        if (!email || !password) {
            showLoginMessage("Enter email and password first to create your account.", "error");
            return;
        }

        if (password.length < 6) {
            showLoginMessage("Password must be at least 6 characters.", "error");
            return;
        }

        signupBtn.disabled = true;
        signupBtn.textContent = "Creating account...";

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            console.error("Signup error:", error);
            showLoginMessage(getAuthErrorMessage(error), "error");
            signupBtn.disabled = false;
            signupBtn.textContent = "Create Farmer Account";
            return;
        }

        if (data.session) {
            showLoginMessage("Account created successfully!", "success");
            setTimeout(() => {
                window.location.replace("dashboard.html");
            }, 500);
        } else {
            showLoginMessage("Account created. Please check email for confirmation before logging in.", "success");
            signupBtn.disabled = false;
            signupBtn.textContent = "Create Farmer Account";
        }
    });
}

/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {
    const logoutButtons = document.querySelectorAll("#logoutBtn, [data-logout]");
    logoutButtons.forEach(button => {
        button.addEventListener("click", logout);
    });
}

async function logout() {
    const confirmed = confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    try {
        await supabase.auth.signOut();
    } catch (err) {
        console.error("Logout error:", err);
    }

    localStorage.removeItem("khet2ghar_farmer_profile");
    localStorage.removeItem("khet2ghar_farmer_email");
    window.location.replace("index.html");
}

/* =========================================================
   HELPERS & MESSAGES
========================================================= */

function showLoginMessage(message, type = "error") {
    const element = document.getElementById("loginMessage");
    if (!element) return;
    element.textContent = message;
    element.className = `bottom-text login-message ${type}`;
}

function getAuthErrorMessage(error) {
    const message = error?.message || "";
    if (message.toLowerCase().includes("invalid login credentials")) {
        return "Invalid email or password.";
    }
    if (message.toLowerCase().includes("email not confirmed")) {
        return "Please verify your email before logging in.";
    }
    if (message.toLowerCase().includes("user already registered")) {
        return "This email is already registered. Please login.";
    }
    return message || "Something went wrong. Please try again.";
}

function showToast(message) {
    let toast = document.getElementById("appToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "appToast";
        toast.className = "app-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function formatRupees(amount) {
    const number = Number(amount) || 0;
    return "₹" + number.toLocaleString("en-IN");
}

function showEmptyState(containerId, icon, title, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">${icon}</div>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Global exposes for legacy inline scripts
window.logout = logout;
window.showToast = showToast;
window.formatRupees = formatRupees;
window.showEmptyState = showEmptyState;
window.escapeHTML = escapeHTML;

export { supabase, showToast, formatRupees, showEmptyState, escapeHTML };
