import { showAlert } from "./alerts.js";

export async function login(email, password) {
    try {
        const res = await fetch("/api/v1/users/signin", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
            }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (data.status == "success") {
            showAlert("success", "Logged in successfully!");
            window.setTimeout(() => {
                location.assign("/");
            }, 500);
        } else {
            showAlert("error", data.message);
        }
    } catch (err) {
        console.error("Network Error!");
        console.error(err);
    }
}

export async function logout() {
    try {
        const res = await fetch("/api/v1/users/signout", {
            method: "GET",
        });
        const data = await res.json();

        if (data.status == "success") {
            location.reload(true);
        } else {
            showAlert("error", data.message);
        }
    } catch (err) {
        console.error("Network Error!");
        console.error(err);
    }
}
