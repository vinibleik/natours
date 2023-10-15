const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");
const router = require("express").Router({ mergeParams: true });

router.use(authController.protect);

router
    .route("/")
    .get(reviewController.setTourId, reviewController.getAllReviews)
    .post(
        authController.restricTo("user"),
        reviewController.setTourUserIds,
        reviewController.createReview,
    );

router
    .route("/:id")
    .get(reviewController.getReview)
    .patch(
        authController.restricTo("user", "admin"),
        reviewController.updateReview,
    )
    .delete(
        authController.restricTo("user", "admin"),
        reviewController.deleteReview,
    );

module.exports = router;
