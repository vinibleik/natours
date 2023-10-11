const Review = require("../models/reviewModel");
const factory = require("../helpers/hadlerFactory");

const setTourId = (req, res, next) => {
    if (req.params.tourId) {
        req.query["tour"] = req.params.tourId;
    }

    next();
};

const setTourUserIds = (req, res, next) => {
    req.body.tour = req.body.tour || req.params.tourId;
    req.body.user = req.body.user || req.user.id;
    next();
};

const getAllReviews = factory.getAll(Review);
const getReview = factory.getOne(Review, { path: "tour" });
const createReview = factory.createOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);

module.exports = {
    getAllReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview,
    setTourId,
    setTourUserIds,
};
