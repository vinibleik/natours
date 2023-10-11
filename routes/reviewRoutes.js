const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const router = require("express").Router({ mergeParams: true });

router
    .route("/")
    .get(reviewController.setTourId, reviewController.getAllReviews)
    .post(
        authController.protect,
        authController.restricTo("user"),
        reviewController.setTourUserIds,
        reviewController.createReview,
    );

router
    .route("/:id")
    .get(reviewController.getReview)
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

module.exports = router;
