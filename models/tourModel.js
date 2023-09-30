const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A tour must have a name"],
            unique: true,
            trim: true,
            maxLength: [40, "A tour name must have at most 40 characters"],
            minLength: [5, "A tour name must have at least 5 characters"],
            validate: {
                validator: function (value) {
                    return value.match(/[^a-z ]/gi) === null;
                },
                message:
                    "Tour name must contain only alpha characters and spaces",
            },
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
            required: [true, "A tour must have a difficulty"],
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "A difficulty must be easy, medium or difficult",
            },
        },
        ratingsAverage: {
            type: Number,
            default: 0,
            min: [0, "Rating must be greater than or equal to 0"],
            max: [5, "Rating must be less than or equal to 5"],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, "A tour must have a price"],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    return value < this.price;
                },
                message:
                    "Discount price {VALUE} should be lower than the regular price",
            },
        },
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
        secretTour: {
            type: Boolean,
            default: false,
        },
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

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

tourSchema.pre("aggregate", function (next) {
    this.pipeline().unshift({
        $match: {
            secretTour: {
                $ne: true,
            },
        },
    });
    next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
