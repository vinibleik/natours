const Tour = require("../models/tourModel");
const User = require("../models/userModel");
const catchAsync = require("../helpers/catchAsync");
const ApiError = require("../helpers/apiError");

const getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find().exec();

    return res.status(200).render("overview", {
        title: "All tours",
        tours,
    });
});

const getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug })
        .populate({
            path: "reviews",
            fields: "review rating user",
        })
        .exec();

    if (!tour) {
        return next(new ApiError("There is no tour with that name", 404));
    }

    return res.status(200).render("tour", {
        title: `${tour.name} Tour`,
        tour,
    });
});

const getLoginForm = (req, res) => {
    return res.status(200).render("login", {
        title: "Log into your account",
    });
};

const getAccount = (req, res) => {
    return res.status(200).render("account", {
        title: "Your account",
    });
};

const updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        },
    );

    return res.status(200).render("account", {
        title: "Your account",
        user,
    });
});

module.exports = {
    getOverview,
    getTour,
    getLoginForm,
    getAccount,
    updateUser,
};
