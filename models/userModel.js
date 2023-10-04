const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const MS_10M = 10 * 60 * 1000;
const RESET_PASS_TOKEN_LEN = 32;

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
        role: {
            type: String,
            enum: {
                values: ["user", "guide", "lead-guide", "admin"],
                message: "A user role must be user, guide, lead-guide or admin",
            },
            default: "user",
        },
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
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
        methods: {
            checkPassword: async function (password) {
                return await bcrypt.compare(password, this.password);
            },
            changedPasswordAfter: function (timestamp) {
                if (this.passwordChangedAt) {
                    const passwordChanged =
                        this.passwordChangedAt.getTime() / 1000;
                    return timestamp < passwordChanged;
                }

                return false;
            },
            newPasswordResetToken: function () {
                const resetToken = crypto
                    .randomBytes(RESET_PASS_TOKEN_LEN)
                    .toString("hex");

                this.passwordResetToken = crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");

                this.passwordResetExpires = Date.now() + MS_10M;

                return resetToken;
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
