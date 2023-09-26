/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getAllUsers = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
const createUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const getUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const updateUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

/**
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * */
const deleteUser = (_req, res) => {
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined",
    });
};

module.exports = {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
};
