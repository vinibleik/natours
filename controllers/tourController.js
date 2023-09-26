const { readFileSync, writeFile } = require("fs");
const { join } = require("path");

const FILE_PATH = join(__dirname, "../dev-data/data/tours-simple.json");

const tours = JSON.parse(readFileSync(FILE_PATH, { encoding: "utf-8" }));

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {function} next
 * */
const checkTourId = (req, res, next, val) => {
    // const id = req.params.id * 1;
    const id = val * 1;
    const tour = tours.find((t) => t.id === id);

    if (!tour) {
        return res.status(404).json({ status: "fail", message: "Invalid ID" });
    }

    req.tour = tour;
    next();
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
function checkTourBody(req, res, next) {
    const { name, price } = req.body;
    if (!name || !price) {
        return res
            .status(400)
            .json({ status: "fail", message: "Invalid body post!" });
    }

    next();
}

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getAllTours = (_req, res) => {
    res.json({ status: "success", results: tours.length, data: { tours } });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getTour = (req, res) => {
    res.status(200).json({ status: "success", data: { tour: req.tour } });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const createTour = (req, res) => {
    const newId = tours.at(-1).id + 1;
    const newTour = { id: newId, ...req.body };
    tours.push(newTour);

    writeFile(FILE_PATH, JSON.stringify(tours), (err) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err });
        }
        res.status(201).json({ status: "success", data: { tour: newTour } });
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const updateTour = (req, res) => {
    const tourId = req.tour.id;
    tours[tourId] = { ...tours[tourId], ...req.body };

    writeFile(FILE_PATH, JSON.stringify(tours), (err) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err });
        }
        res.status(200).json({
            status: "success",
            data: { tour: tours[tourId] },
        });
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const deleteTour = (req, res) => {
    const tourId = req.tour.id;

    const deletedTour = tours.splice(tourId, 1);
    writeFile(FILE_PATH, JSON.stringify(tours), (err) => {
        if (err) {
            return res.status(500).json({ status: "error", message: err });
        }
        res.status(200).json({ status: "success", data: { deletedTour } });
    });
};

module.exports = {
    checkTourId,
    checkTourBody,
    getAllTours,
    getTour,
    createTour,
    updateTour,
    deleteTour,
};
