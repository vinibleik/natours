const Review = require("../models/reviewModel");
const catchAsync = require("../helpers/catchAsync");
const ApiFeatures = require("../helpers/apiFeatures");

const getAllReviews = catchAsync(async (req, res, _next) => {
    const filter = req.params.tourId ? { tour: req.params.tourId } : {};
    const reviews = await new ApiFeatures(Review, filter).all().exec();

    return res.status(200).json({
        status: "success",
        results: reviews.length,
        data: { reviews },
    });
});

const createReview = catchAsync(async (req, res, _next) => {
    req.body.tour = req.body.tour || req.params.tourId;
    req.body.user = req.body.user || req.user.id;

    const review = await Review.create(req.body);
    return res.status(201).json({ status: "success", data: { review } });
});

module.exports = {
    getAllReviews,
    createReview,
};
