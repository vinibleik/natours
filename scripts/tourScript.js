require("dotenv").config();

const { readFile } = require("fs/promises");
const Tour = require("../models/tourModel");
const connectDB = require("../helpers/connectDB");
const { join } = require("path");

const getTours = async () => {
    try {
        const pathToData = join(__dirname, "../dev-data/data/tours.json");
        const tours = await readFile(pathToData, { encoding: "utf8" });
        return JSON.parse(tours);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const importTours = async () => {
    try {
        const tours = await getTours();
        await Tour.create(tours);
        console.log("Tours inserted successfully!!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const deleteTours = async () => {
    try {
        await Tour.deleteMany();
        console.log("All Tours deleted!");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const usage = () => {
    console.log(`node ${__filename} option`);
    console.log("option:");
    console.log("\t--import -> Import all the data Tour into DB");
    console.log("\t--delete -> Delete all the data Tour into DB");
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
            await importTours();
        } else {
            await deleteTours();
        }
        process.exit(0);
    })();
}

module.exports = {
    importTours,
    deleteTours,
};
