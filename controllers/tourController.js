const Tour = require("../models/tourModel");
const catchAsync = require("../helpers/catchAsync");
const factory = require("../helpers/hadlerFactory");
const ApiError = require("../helpers/apiError");

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
            $match: { ratingsAverage: { $gte: 4.5 } },
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
    const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

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

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyTours,
    getToursWithin,
};
