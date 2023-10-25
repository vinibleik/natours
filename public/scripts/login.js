async function login(email, password) {
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
        console.log(data);
    } catch (err) {
        console.log("Network Error!");
    }
}

document.querySelector(".form").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
});
