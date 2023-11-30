/* eslint-disable */
import { showAlert } from "./alerts";

export const bookTour = async (tourId) => {
    try {
        const response = await fetch(
            `/api/v1/bookings/checkout-session/${tourId}`,
        );
        const data = await response.json();
        if (data.status === "success") {
            window.location = data.session.url;
        } else {
            showAlert("error", "Error in booking tour! Try again later.");
        }
    } catch (err) {
        console.log(err);
        showAlert("error", "Error in booking tour! Try again later.");
    }
};
