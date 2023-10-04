const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

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
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, "A user must have to confirm password!"],
            validate: {
                validator: function (value) {
                    return value === this.password;
                },
                message: "passwordConfirm must equals to passwords",
            },
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
        methods: {
            checkPassword: async function (password) {
                return await bcrypt.compare(password, this.password);
            },
        },
    },
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }

    this.passwordConfirm = undefined;
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
