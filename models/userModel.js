const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A user must have a name!"],
        },
        email: {
            type: String,
            required: [true, "A user must have a email!"],
            unique: true,
            validate: {
                validator: validator.isEmail,
                message: "Invalid email!",
            },
        },
        photo: String,
        password: {
            type: String,
            required: [true, "A user must have a password!"],
            minLength: [8, "A password must have at least 8 characters!"],
        },
        passwordConfirm: {
            type: String,
            required: [true, "A user must have to confirm password!"],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
    },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
