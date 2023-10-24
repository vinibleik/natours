const Tour = require("../models/tourModel");
const catchAsync = require("../helpers/catchAsync");

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

module.exports = {
    getOverview,
    getTour,
    getLoginForm,
};
