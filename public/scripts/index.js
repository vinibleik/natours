import { login, logout } from "./login.js";
import { updateData } from "./update.js";

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

const formUpdateData = document.querySelector(".form-user-data");
if (formUpdateData) {
    formUpdateData.addEventListener("submit", function (e) {
        e.preventDefault();
        const btn = document.getElementById("btn-save-data");
        const previousValue = btn.textContent;
        btn.textContent = "Updating...";
        btn.disabled = true;
        const formData = new FormData(e.target);
        updateData("user-data", {
            name: formData.get("name"),
            email: formData.get("email"),
        }).then(() => {
            btn.textContent = previousValue;
            btn.disabled = false;
        });
    });
}

const formUpdatePassword = document.querySelector(".form-user-settings");
if (formUpdatePassword) {
    formUpdatePassword.addEventListener("submit", function (e) {
        const btn = document.getElementById("btn-save-password");
        const previousValue = btn.textContent;
        btn.textContent = "Updating...";
        btn.disabled = true;
        e.preventDefault();
        const formData = new FormData(formUpdatePassword);
        updateData("password", {
            curPassword: formData.get("curPassword"),
            newPassword: formData.get("newPassword"),
            newPasswordConfirm: formData.get("newPasswordConfirm"),
        }).then(() => {
            btn.textContent = previousValue;
            btn.disabled = false;
        });
    });
}
