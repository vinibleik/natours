const router = require("express").Router();
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

// router.param("id", tourController.checkTourId);

router
    .route("/")
    .get(authController.protect, tourController.getAllTours)
    .post(tourController.createTour);

router.get(
    "/top-5-cheap",
    tourController.aliasTopTours,
    tourController.getAllTours,
);

router.get("/tour-stats", tourController.getTourStats);
router.get("/monthly-tours/:year", tourController.getMonthlyTours);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
