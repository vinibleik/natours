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

const protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new ApiError("You're not logged in!"), 401);
    }

    const decoded = apiJWT.verifyJWT(token);

    const user = await User.findById(decoded.id).exec();

    if (!user) {
        return next(
            new ApiError("User belonging to this token no longer exists!", 401),
        );
    }

    next();
});

module.exports = {
    signup,
    signin,
    protect,
};
