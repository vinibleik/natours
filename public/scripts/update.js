import { showAlert } from "./alerts.js";

/**
 * @typedef {Object} UserData
 * @property {string} name - Name of the user
 * @property {string} email - Email of the user
 *
 * @typedef {Object} UserPassword
 * @property {string} curPassword - Current user's password
 * @property {string} newPassword - New password for the user
 * @property {string} newPasswordConfirm - New password confirm for the user
 * */

async function update(url, method, body) {
    try {
        const response = await fetch(url, {
            method: method,
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.status === "success") {
            showAlert("success", "Sucessfully updated!");
            window.setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            showAlert("error", data.message);
        }
    } catch (err) {
        showAlert("error", "Network Error!");
        console.error(err);
    }
}

function updatePassword(curPassword, newPassword, newPasswordConfirm) {
    return update("/api/v1/users/update-password", "PATCH", {
        curPassword,
        newPassword,
        newPasswordConfirm,
    });
}

function updateUserData(name, email) {
    return update("/api/v1/users/update-me", "PUT", {
        name,
        email,
    });
}

/**
 * @param {("user-data" | "password")} type
 * @param {UserData | UserPassword} body
 * */
export async function updateData(type, body) {
    switch (type) {
        case "user-data":
            return await updateUserData(body.name, body.email);
        case "password":
            return await updatePassword(
                body.curPassword,
                body.newPassword,
                body.newPasswordConfirm,
            );
        default:
            return showAlert("error", "Invalid update!");
    }
}
