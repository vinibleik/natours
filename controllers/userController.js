const User = require("../models/userModel");
const catchAsync = require("../helpers/catchAsync");
const AppError = require("../helpers/apiError");
const filterObj = require("../helpers/filterObj");
const factory = require("../helpers/hadlerFactory");

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
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

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
const createUser = factory.createOne(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
};
