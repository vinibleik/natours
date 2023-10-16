const router = require("express").Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("../routes/reviewRoutes");

// router.param("id", tourController.checkTourId);

router
    .route("/")
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restricTo("admin", "lead-guide"),
        tourController.createTour,
    );

router.get(
    "/top-5-cheap",
    tourController.aliasTopTours,
    tourController.getAllTours,
);

router.get("/tour-stats", tourController.getTourStats);
router.get(
    "/monthly-tours/:year",
    authController.protect,
    authController.restricTo("admin", "lead-guide", "guide"),
    tourController.getMonthlyTours,
);
router.get(
    "/tours-within/:distance/:center/:unit",
    tourController.getToursWithin,
);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restricTo("admin", "lead-guide"),
        tourController.updateTour,
    )
    .delete(
        authController.protect,
        authController.restricTo("admin", "lead-guide"),
        tourController.deleteTour,
    );

router.use("/:tourId/reviews", reviewRouter);

module.exports = router;
