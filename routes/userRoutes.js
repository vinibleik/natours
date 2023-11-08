const router = require("express").Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/signout", authController.signout);
router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/update-password", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);
router.put(
    "/update-me",
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe,
);
router.delete("/delete-me", userController.deleteMe);

router.use(authController.restricTo("admin"));

router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;
