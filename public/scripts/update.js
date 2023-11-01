import { showAlert } from "./alerts.js";

export async function update(name, email) {
    try {
        const response = await fetch("/api/v1/users/update-me", {
            method: "PUT",
            body: JSON.stringify({
                name,
                email,
            }),
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        if (data.status === "success") {
            showAlert("success", "Sucessfully updated!");
            window.setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            showAlert("error", "Invalid name or email!");
        }
    } catch (err) {
        console.error("Network Error!");
        console.error(err);
    }
}
