const parseFilterQuery = require("../helpers/parseQueryFilter");
const Tour = require("../models/tourModel");

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getAllTours = async (req, res) => {
    try {
        const queryFind = parseFilterQuery(Tour, req.query);
        let query = Tour.find(queryFind);

        const sort = req.query.sort || "createdAt";
        query = query.sort(sort.replaceAll(",", " "));

        const tours = await query.exec();

        return res.status(200).json({
            status: "success",
            results: tours.length,
            data: { tours },
        });
    } catch (error) {
        return res.status(400).json({ status: "fail", message: error });
    }
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);
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
            },
        );
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
        const deletedTour = await Tour.findByIdAndDelete(req.params.id);
        return res
            .status(200)
            .json({ status: "success", data: { deletedTour } });
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
};
