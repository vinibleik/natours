const User = require("../models/userModel");
const catchAsync = require("../helpers/catchAsync");

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
};
