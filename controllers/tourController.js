const Tour = require("../models/tourModel");
const apiFeatures = require("../helpers/apiFeatures");

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getAllTours = async (req, res) => {
    try {
        const tours = await new apiFeatures(Tour, req.query).all().exec();

        return res.status(200).json({
            status: "success",
            results: tours.length,
            data: { tours },
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ status: "fail", message: error });
    }
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getTour = async (req, res) => {
    try {
        const tour = await new apiFeatures(Tour)
            .findById(req.params.id)
            .select()
            .exec();
        return res.status(200).json({ status: "success", data: { tour } });
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);
        return res.status(200).json({ status: "success", data: { newTour } });
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const updateTour = async (req, res) => {
    try {
        const updatedTour = await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        ).exec();
        return res
            .status(200)
            .json({ status: "success", data: { updatedTour } });
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id).exec();
        return res.status(200).json({ status: "success" });
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

const aliasTopTours = (req, _res, next) => {
    req.query = {
        limit: "5",
        sort: "-ratingsAverage,price",
        fields: "name,price,ratingsAverage,summary,difficulty",
    };

    next();
};

const getTourStats = async (_req, res) => {
    try {
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
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

const getMonthlyTours = async (req, res) => {
    try {
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
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

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
