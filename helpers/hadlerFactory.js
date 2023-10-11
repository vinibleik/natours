const ApiError = require("./apiError");
const catchAsync = require("./catchAsync");
const ApiFeatures = require("./apiFeatures");

const getAll = (Model) => {
    return catchAsync(async (req, res, next) => {
        const docs = await new ApiFeatures(Model, req.query).all().exec();

        return res.status(200).json({
            status: "success",
            results: docs.length,
            data: { [`${Model.modelName.toLowerCase()}s`]: docs },
        });
    });
};

const getOne = (Model, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);

        if (populateOptions) {
            query = query.populate(populateOptions);
        }

        const doc = await query.exec();

        if (!doc) {
            return next(
                new ApiError(
                    `No ${Model.modelName} found with ID: ${req.params.id}`,
                    404,
                ),
            );
        }

        return res.status(200).json({
            status: "success",
            data: {
                [`${Model.modelName.toLowerCase()}`]: doc,
            },
        });
    });
};

const createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.create(req.body);
        return res.status(201).json({
            status: "success",
            data: {
                [`${Model.modelName.toLowerCase()}`]: doc,
            },
        });
    });
};

const updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).exec();

        if (!doc) {
            return next(
                new ApiError(
                    `No ${Model.modelName} found with ID: ${req.params.id}`,
                    404,
                ),
            );
        }

        return res.status(200).json({
            status: "success",
            data: {
                [`${Model.modelName.toLowerCase()}`]: doc,
            },
        });
    });
};

const deleteOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id).exec();

        if (!doc) {
            return next(
                new ApiError(
                    `No ${Model.modelName} found with ID: ${req.params.id}`,
                    404,
                ),
            );
        }

        return res.status(204).json({
            status: "success",
        });
    });
};

module.exports = {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
};
