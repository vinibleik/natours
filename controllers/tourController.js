const multer = require("multer");
const sharp = require("sharp");
const Tour = require("../models/tourModel");
const catchAsync = require("../helpers/catchAsync");
const factory = require("../helpers/hadlerFactory");
const ApiError = require("../helpers/apiError");

const M_TO_MILES = 0.0006213712;
const M_TO_KM = 0.001;
const EARTH_RADIUS_MILES = 3963.2;
const EARTH_RADIUS_KM = 6378.1;

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

// const uploadTourImages = upload.array("images", 3);
const uploadTourImages = upload.fields([
    { name: "imageCover", maxCount: 1 },
    { name: "images", maxCount: 3 },
]);

const resizeTourImages = catchAsync(async (req, _res, next) => {
    if (!req.files.imageCover || !req.files.images) {
        return next();
    }

    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;

    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, index) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${
                index + 1
            }.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        }),
    );

    next();
});

const aliasTopTours = (req, _res, next) => {
    req.query = {
        limit: "5",
        sort: "-ratingsAverage,price",
        fields: "name,price,ratingsAverage,summary,difficulty",
    };

    next();
};

const getAllTours = factory.getAll(Tour);
const getTour = factory.getOne(Tour, { path: "reviews", select: "-__v" });
const createTour = factory.createOne(Tour);
const updateTour = factory.updateOne(Tour);
const deleteTour = factory.deleteOne(Tour);

const getTourStats = catchAsync(async (_req, res, _next) => {
    const status = await Tour.aggregate([
        {
            $match: {
                secretTour: {
                    $ne: true,
                },
            },
        },
        {
            $group: {
                _id: { $toUpper: "$difficulty" },
                numTours: { $sum: 1 },
                numRatings: { $sum: "$ratingsQuantity" },
                avgRating: { $avg: "$ratingsAverage" },
                avgPrice: { $avg: "$price" },
                minPrice: { $min: "$price" },
                maxPrice: { $max: "$price" },
            },
        },
        {
            $sort: { avgPrice: -1 },
        },
    ]).exec();

    return res.status(200).json({ status: "success", data: { status } });
});

const getMonthlyTours = catchAsync(async (req, res, _next) => {
    const year = req.params.year * 1;

    const status = await Tour.aggregate([
        {
            $match: {
                secretTour: {
                    $ne: true,
                },
            },
        },
        {
            $unwind: "$startDates",
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: "$startDates" },
                numTours: { $sum: 1 },
                tours: { $push: "$name" },
            },
        },
        {
            $addFields: {
                month: "$_id",
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: {
                numTours: -1,
            },
        },
        {
            $limit: 12,
        },
    ]).exec();

    return res.status(200).json({ status: "success", data: { status } });
});

const getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, center, unit } = req.params;

    const [lat, long] = center.split(",");
    const radius =
        unit === "mi"
            ? distance / EARTH_RADIUS_MILES
            : distance / EARTH_RADIUS_KM;

    if (!lat || !long) {
        return next(
            new ApiError(
                "Wrong format! Please provide latitude and longitude as: lat,long",
                400,
            ),
        );
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [[long, lat], radius],
            },
        },
    });

    return res.status(200).json({
        status: "success",
        results: tours?.length ?? 0,
        tours,
    });
});

const getTourDistances = catchAsync(async (req, res, next) => {
    const { center, unit } = req.params;

    const [lat, long] = center.split(",");

    const multiplier = unit === "mi" ? M_TO_MILES : M_TO_KM;

    if (!lat || !long) {
        return next(
            new ApiError(
                "Wrong format! Please provide latitude and longitude as: lat,long",
                400,
            ),
        );
    }

    const tours = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [long * 1, lat * 1],
                },
                distanceField: "distance",
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                name: 1,
                distance: 1,
            },
        },
    ]);

    return res.status(200).json({
        status: "success",
        results: tours.length,
        tours,
    });
});

module.exports = {
    uploadTourImages,
    resizeTourImages,
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyTours,
    getToursWithin,
    getTourDistances,
};
