// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

require("dotenv").config(); // Configure the env before to use...
require("./helpers/connectDB")(); // Connect to the DB

const app = require("./app");

let PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log("Listening on port ", PORT);
    // console.log(app._router);
    // app._router.stack.forEach((e) => {
    //     if (e.name === "router") {
    //         console.log(e.handle);
    //         e.handle.stack.forEach((x) => {
    //             console.log(x.route);
    //         });
    //     }
    // });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error(err);
    server.close(() => {
        process.exit(1);
    });
});

// Heroku sends a SIGTERM signal to the process when it wants to shut down the dyno
// So we need to handle this signal to close the server before the process ends
process.on("SIGTERM", () => {
    console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
    server.close(() => {
        console.log("💥 Process terminated!");
    });
});
