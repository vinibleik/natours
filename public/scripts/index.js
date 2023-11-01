import { login, logout } from "./login.js";
import { update } from "./update.js";

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

const formUpdate = document.querySelector(".form-user-data");
if (formUpdate) {
    formUpdate.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log(formData);
        update(formData.get("name"), formData.get("email"));
    });
}
