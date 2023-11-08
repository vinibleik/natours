const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const MS_10M = 10 * 60 * 1000;
const RESET_PASS_TOKEN_LEN = 32;
const HASH_ALG = "sha256";

/**
 * @param {string} token
 * @returns {string} hashed token
 * */
const hashToken = (token) => {
    return crypto.createHash(HASH_ALG).update(token).digest("hex");
};

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
        photo: {
            type: String,
            default: "default.jpg",
        },
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
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
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

                this.passwordResetToken = hashToken(resetToken);
                this.passwordResetExpires = Date.now() + MS_10M;

                return resetToken;
            },
            resetPassword: async function (password, passwordConfirm) {
                this.password = password;
                this.passwordConfirm = passwordConfirm;
                this.passwordResetToken = undefined;
                this.passwordResetExpires = undefined;

                return await this.save();
            },
        },
        statics: {
            getUserByToken: async function (token) {
                const hashedToken = hashToken(token);

                return await this.findOne({
                    passwordResetToken: hashedToken,
                    passwordResetExpires: { $gt: Date.now() },
                }).exec();
            },
        },
    },
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }
    }

    this.passwordConfirm = undefined;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
