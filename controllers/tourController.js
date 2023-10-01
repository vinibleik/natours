const Tour = require("../models/tourModel");
const apiFeatures = require("../helpers/apiFeatures");
const catchAsync = require("../helpers/catchAsync");

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getAllTours = catchAsync(async (req, res, next) => {
    const tours = await new apiFeatures(Tour, req.query).all().exec();

    return res.status(200).json({
        status: "success",
        results: tours.length,
        data: { tours },
    });
});

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getTour = catchAsync(async (req, res, next) => {
    const tour = await new apiFeatures(Tour)
        .findById(req.params.id)
        .select()
        .exec();
    return res.status(200).json({ status: "success", data: { tour } });
});

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    return res.status(200).json({ status: "success", data: { newTour } });
});

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const updateTour = catchAsync(async (req, res) => {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).exec();
    return res.status(200).json({ status: "success", data: { updatedTour } });
});

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const deleteTour = catchAsync(async (req, res, next) => {
    await Tour.findByIdAndDelete(req.params.id).exec();
    return res.status(200).json({ status: "success" });
});

const aliasTopTours = (req, _res, next) => {
    req.query = {
        limit: "5",
        sort: "-ratingsAverage,price",
        fields: "name,price,ratingsAverage,summary,difficulty",
    };

    next();
};

const getTourStats = catchAsync(async (_req, res, next) => {
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

const getMonthlyTours = catchAsync(async (req, res, next) => {
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

module.exports = {
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
    aliasTopTours,
    getTourStats,
    getMonthlyTours,
};
