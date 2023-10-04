const User = require("../models/userModel");
const ApiError = require("../helpers/apiError");
const catchAsync = require("../helpers/catchAsync");
const apiJWT = require("../helpers/apiJWT");

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

    return res.status(200).json({ status: "success", resetToken });
});

const resetPassword = () => {};

module.exports = {
    signup,
    signin,
    protect,
    restricTo,
    forgotPassword,
    resetPassword,
};
