const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review can't be empty!"],
        },
        rating: {
            type: String,
            validate: {
                validator: function (value) {
                    return value >= 0 && value <= 5;
                },
                message: "Review rating must be between 0 and 5.",
            },
        },
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tour",
            required: [true, "Review must belong to a tour."],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Review must have a author."],
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo",
    });
    next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
