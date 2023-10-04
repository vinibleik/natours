const jwt = require("jsonwebtoken");

const signJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRESS_IN,
    });
};

const verifyJWT = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
    signJWT,
    verifyJWT,
};
