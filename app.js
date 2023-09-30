const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

if (process.env.NODE_ENV === "production") {
    const logPath = path.join(__dirname, "logs");
    // const logStream = fs.createWriteStream(
    //     path.join(logPath, `${new Date().toISOString()}.log`),
    //     { flags: "a" },
    // );
    //
    const logStream = fs.createWriteStream(path.join(logPath, "access.log"), {
        flags: "a",
    });
    app.use(morgan("combined", { stream: logStream }));
}

app.use(express.json());
app.use(express.static("public"));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res) => {
    return res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});

module.exports = app;
