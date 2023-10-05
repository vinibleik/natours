const User = require("../models/userModel");
const catchAsync = require("../helpers/catchAsync");
const ApiError = require("../helpers/apiError");
const filterObj = require("../helpers/filterObj");

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().exec();

    return res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users,
        },
    });
});

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new ApiError(
                "This route is not for password updates. Please use /update-password.",
                400,
            ),
        );
    }

    const filteredBody = filterObj(req.body, "name", "email");
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

const deleteMe = catchAsync(async (req, res, _next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    return res.status(204).json({
        status: "success",
        data: null,
    });
});

const createUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

const getUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

const updateUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

const deleteUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
};
