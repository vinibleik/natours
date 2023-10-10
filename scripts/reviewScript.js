require("dotenv").config();

const { readFile } = require("fs/promises");
const Review = require("../models/reviewModel");
const connectDB = require("../helpers/connectDB");
const { join } = require("path");

const getReviews = async () => {
    try {
        const pathToData = join(__dirname, "../dev-data/data/reviews.json");
        const reviews = await readFile(pathToData, { encoding: "utf8" });
        return JSON.parse(reviews);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const importReviews = async () => {
    try {
        const reviews = await getReviews();
        await Review.create(reviews);
        console.log("Reviews inserted successfully!!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const deleteReviews = async () => {
    try {
        await Review.deleteMany();
        console.log("All Reviews deleted!");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const usage = () => {
    console.log(`node ${__filename} option`);
    console.log("option:");
    console.log("\t--import -> Import all the data Review into DB");
    console.log("\t--delete -> Delete all the data Review into DB");
};

if (require.main === module) {
    (async () => {
        if (
            process.argv.length < 3 ||
            (process.argv[2] !== "--import" && process.argv[2] !== "--delete")
        ) {
            usage();
            process.exit(1);
        }

        await connectDB();
        if (process.argv[2] === "--import") {
            await importReviews();
        } else {
            await deleteReviews();
        }
        process.exit(0);
    })();
}

module.exports = {
    import: importReviews,
    delete: deleteReviews,
};
