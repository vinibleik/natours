const viewController = require("../controllers/viewController");

const router = require("express").Router();

router.get("/", viewController.getOverview);
router.get("/tour", viewController.getTour);

module.exports = router;
