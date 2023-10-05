const User = require("../models/userModel");
const ApiError = require("../helpers/apiError");
const catchAsync = require("../helpers/catchAsync");
const apiJWT = require("../helpers/apiJWT");
const sendEmail = require("../helpers/email");

const signup = catchAsync(async (req, res, next) => {
    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        photo: req.body.photo,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });

    const token = apiJWT.signJWT(user._id);

    return res.status(201).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
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

    const token = apiJWT.signJWT(user._id);

    res.status(200).json({
        status: "success",
        token,
    });
});

const protect = catchAsync(async (req, _res, next) => {
    let token = undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
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

    const resetURL = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new
password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password,
please ignore this email!`;

    try {
        await sendEmail({
            to: user.email,
            subject: "Your password reset token (valid for 10 min)",
            text: message,
        });

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

    const token = apiJWT.signJWT(user._id);

    return res.status(200).json({
        status: "success",
        token,
    });
});

module.exports = {
    signup,
    signin,
    protect,
    restricTo,
    forgotPassword,
    resetPassword,
};
