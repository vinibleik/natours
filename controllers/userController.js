const User = require("../models/userModel");
const catchAsync = require("../helpers/catchAsync");
const ApiError = require("../helpers/apiError");
const filterObj = require("../helpers/filterObj");
const factory = require("../helpers/hadlerFactory");
const multer = require("multer");
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public/img/users");
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split("/").at(-1);
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        return cb(null, true);
    }
    return cb(
        new ApiError("Not an image! Please upload only images.", 400),
        false,
    );
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

const uploadUserPhoto = upload.single("photo");

const resizeUserPhoto = catchAsync(async (req, _res, next) => {
    if (!req.file) {
        return next();
    }

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

const updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new ApiError(
                "This route is not for password updates. Please use /update-password.",
                400,
            ),
        );
    }

    const filteredBody = filterObj(req.body, "name", "email");

    if (req.file) {
        filteredBody.photo = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json({
        status: "success",
        data: {
            user,
        },
    });
});

const deleteMe = catchAsync(async (req, res, _next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    return res.status(204).json({
        status: "success",
        data: null,
    });
});

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
const createUser = factory.createOne(User);
const updateUser = factory.updateOne(User);
const deleteUser = factory.deleteOne(User);

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto,
};
