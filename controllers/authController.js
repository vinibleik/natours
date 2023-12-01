const User = require("../models/userModel");
const ApiError = require("../helpers/apiError");
const catchAsync = require("../helpers/catchAsync");
const apiJWT = require("../helpers/apiJWT");
const Email = require("../helpers/email");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {number} statusCode
 * @param {import("mongoose").Document<User>} [user]
 * @returns {import("express").Response}
 * */
const createAndSendToken = (req, res, statusCode, user) => {
    const token = apiJWT.signJWT(user._id);

    res.cookie("jwt", token, {
        expires: new Date(
            Date.now() +
                process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
        ),
        httpOnly: true,
        secure: req.secure || req.headers["x-forwarded-proto"] === "https",
    });

    user.password = undefined;

    return res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

const signup = catchAsync(async (req, res, _next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });

    const url = `${req.protocol}://${req.get("host")}/me`;
    const email = new Email(user, url);
    await email.sendWelcome();

    return createAndSendToken(req, res, 201, user);
});

const signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ApiError("Please provide email and password", 400));
    }
    const user = await User.findOne({ email }).select("+password").exec();

    if (!user || !(await user.checkPassword(password))) {
        return next(new ApiError("Email or password invalid!", 401));
    }

    return createAndSendToken(req, res, 200, user);
});

const signout = (_req, res, _next) => {
    res.cookie("jwt", "", {
        expires: new Date(Date.now() + 1000),
        httpOnly: true,
    });
    return res.status(200).json({ status: "success" });
};

const protect = catchAsync(async (req, res, next) => {
    let token = undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    // Verify if token exists
    if (!token) {
        return next(new ApiError("You're not logged in!", 401));
    }

    // Verify token
    const decoded = apiJWT.verifyJWT(token);

    const user = await User.findById(decoded.id).exec();

    // Check if the user still exist
    if (!user) {
        return next(
            new ApiError("User belonging to this token no longer exists!", 401),
        );
    }

    // Check if the user changed the password after the token was issued.
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(
            new ApiError(
                "User recently changed password. Please log in again!",
                401,
            ),
        );
    }

    req.user = user;
    res.locals.user = user;
    next();
});

const isLoggedIn = catchAsync(async (req, res, next) => {
    if (!req.cookies.jwt) {
        return next();
    }

    const token = req.cookies.jwt;

    // Verify token
    const decoded = apiJWT.verifyJWT(token);

    const user = await User.findById(decoded.id).exec();

    // Check if the user still exist
    if (!user) {
        return next();
    }

    // Check if the user changed the password after the token was issued.
    if (user.changedPasswordAfter(decoded.iat)) {
        return next();
    }

    res.locals.user = user;
    next();
});

const restricTo = (...roles) => {
    return (req, _res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ApiError(
                    "You don't have permission to perform this action!",
                    403,
                ),
            );
        }

        next();
    };
};

const forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email }).exec();

    if (!user) {
        return next(
            new ApiError("There's no user with that email address", 404),
        );
    }

    const resetToken = user.newPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
        "host",
    )}/api/v1/users/reset-password/${resetToken}`;

    try {
        await new Email(user, resetURL).sendPasswordReset();

        return res
            .status(200)
            .json({ status: "success", message: "Token sent to email!" });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(
            new ApiError(
                "There was an error sending the email. Try again later!",
                500,
            ),
        );
    }
});

const resetPassword = catchAsync(async (req, res, next) => {
    const user = await User.getUserByToken(req.params.token);

    if (!user) {
        return next(new ApiError("Token is invalid or has expired!", 400));
    }

    await user.resetPassword(req.body.password, req.body.passwordConfirm);

    return createAndSendToken(req, res, 200, user);
});

const updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password").exec();
    const { curPassword, newPassword, newPasswordConfirm } = req.body;

    if (!(await user.checkPassword(curPassword))) {
        return next(new ApiError("Incorrect password!", 401));
    }

    await user.resetPassword(newPassword, newPasswordConfirm);

    return createAndSendToken(req, res, 200, user);
});

module.exports = {
    signup,
    signin,
    signout,
    protect,
    restricTo,
    forgotPassword,
    resetPassword,
    updatePassword,
    isLoggedIn,
};
