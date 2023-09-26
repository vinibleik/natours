const router = require("express").Router();
const tourController = require("../controllers/tourController");

router.param("id", tourController.checkTourId);

router
    .route("/")
    .get(tourController.getAllTours)
    .post(tourController.checkTourBody, tourController.createTour);

router
    .route("/:id")
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;
