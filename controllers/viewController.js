const Tour = require("../models/tourModel");
const catchAsync = require("../helpers/catchAsync");

const getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find().exec();

    return res.status(200).render("overview", {
        title: "All tours",
        tours,
    });
});

const getTour = (req, res) => {
    return res.status(200).render("tour", {
        title: "The Forest Hiker Tour",
    });
};

module.exports = {
    getOverview,
    getTour,
};
