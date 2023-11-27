import { showAlert } from "./alerts.js";

/**
 * @typedef {FormData} UserData
 *
 * @typedef {Object} UserPassword
 * @property {string} curPassword - Current user's password
 * @property {string} newPassword - New password for the user
 * @property {string} newPasswordConfirm - New password confirm for the user
 * */

async function update(url, options) {
    try {
        const response = await fetch(url, options);
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
    const options = {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            curPassword,
            newPassword,
            newPasswordConfirm,
        }),
    };
    return update("/api/v1/users/update-password", options);
}

function updateUserData(formData) {
    const options = {
        method: "PUT",
        body: formData,
    };
    return update("/api/v1/users/update-me", options);
}

/**
 * @param {("user-data" | "password")} type
 * @param {UserData | UserPassword} body
 * */
export async function updateData(type, body) {
    switch (type) {
        case "user-data":
            return await updateUserData(body);
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
