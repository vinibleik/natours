import { login, logout } from "./login.js";

const form = document.querySelector(".form--login");
if (form) {
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        login(email, password);
    });
}

const logoutBtn = document.querySelector(".nav__el--logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
}
