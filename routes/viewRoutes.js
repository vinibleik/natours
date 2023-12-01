const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

const router = require("express").Router();

router.use(viewController.alerts);

router.get("/", authController.isLoggedIn, viewController.getOverview);
router.get("/tour/:slug", authController.isLoggedIn, viewController.getTour);
router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/me", authController.protect, viewController.getAccount);
router.get("/my-tours", authController.protect, viewController.getMyTours);

router.post(
    "/submit-user-data",
    require("express").urlencoded({ extended: true, limit: "10kb" }),
    authController.protect,
    viewController.updateUser,
);

module.exports = router;
