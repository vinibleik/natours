const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name"],
            unique: true,
            trim: true,
        },
        slug: String,
        duration: {
            type: Number,
            require: [true, "A tour must have a duration"],
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a group size"],
        },
        difficulty: {
            type: String,
            required: [true, "A tour must have a difficult"],
        },
        ratingsAverage: {
            type: Number,
            default: 0,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"],
        },
        priceDiscount: Number,
        summary: {
            type: String,
            required: [true, "A tour must have a summary"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, "A tour must have a cover image"],
        },
        images: [String],
        startDates: [Date],
    },
    {
        timestamps: { createdAt: true, updatedAt: true },
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        virtuals: {
            durationWeeks: {
                get() {
                    if (this.duration == null) {
                        return 0;
                    }

                    return Math.floor(this.duration / 7);
                },
            },
        },
    },
);

tourSchema.pre("save", function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
