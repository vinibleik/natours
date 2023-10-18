const fs = require("fs");
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const ApiError = require("./helpers/apiError");
const globalErrorController = require("./controllers/errorController");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(helmet());

// Development logging
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

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            "duration",
            "ratingsQuantity",
            "ratingsAverage",
            "maxGroupSize",
            "difficulty",
            "price",
        ],
    }),
);

// Limit requests from same IP
app.use(
    "/api",
    rateLimit({
        max: 100,
        windowMs: 60 * 60 * 1000,
        message: "Too many requests from this IP, please try again in an hour!",
    }),
);

// Routes
app.get("/", (_req, res) => {
    res.status(200).render("base", {
        tour: "Jonas",
    });
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, _res, next) => {
    next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorController);

module.exports = app;
