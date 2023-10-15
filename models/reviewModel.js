const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review can't be empty!"],
        },
        rating: {
            type: Number,
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
        statics: {
            calcAverageRatings: async function (tourId) {
                const stats = await this.aggregate([
                    {
                        $match: { tour: tourId },
                    },
                    {
                        $group: {
                            _id: "$tour",
                            nRatings: { $count: {} },
                            avgRating: { $avg: "$rating" },
                        },
                    },
                ]).exec();

                await Tour.findByIdAndUpdate(tourId, {
                    ratingsQuantity: stats[0]?.nRatings ?? 0,
                    ratingsAverage: stats[0]?.avgRating ?? 0,
                });
            },
        },
    },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "name photo",
    });
    next();
});

reviewSchema.post("save", function (doc) {
    this.constructor.calcAverageRatings(doc.tour);
});

reviewSchema.post(/^findOneAnd/, function (doc, next) {
    if (doc) {
        this.model.calcAverageRatings(doc.tour);
    }
    next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
