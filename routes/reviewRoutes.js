const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const router = require("express").Router();

router
    .route("/")
    .get(reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restricTo("user"),
        reviewController.createReview,
    );

module.exports = router;
