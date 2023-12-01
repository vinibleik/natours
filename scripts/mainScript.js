require("dotenv").config();

const connectDB = require("../helpers/connectDB");
const tourScript = require("./tourScript");
const userScript = require("./userScript");
const reviewScript = require("./reviewScript");

const usage = () => {
    console.log(`node ${__filename} [ model ] option`);
    console.log("models (1 or more):");
    console.log("--all -> All models");
    console.log("--tour -> Tour model");
    console.log("--user -> User model");
    console.log("--review -> Review model");
    console.log("option (last paremeter):");
    console.log("\t--import -> Import all the data Tour into DB");
    console.log("\t--delete -> Delete all the data Tour into DB");
};

const parseOption = (option) => {
    if (option === "--import") {
        return "import";
    }

    if (option === "--delete") {
        return "delete";
    }

    throw new Error("Invalid option: ", option);
};

const parseModels = (models) => {
    const scripts = {
        tour: tourScript,
        user: userScript,
        review: reviewScript,
    };

    if (models.includes("--all")) {
        return Object.values(scripts);
    }

    let arr = [];
    models.forEach((element) => {
        if (element in scripts) {
            arr.push(scripts[element]);
        }
    });
    return arr;
};

const parseArgs = () => {
    return {
        scripts: parseModels(process.argv.slice(2, -1)),
        option: parseOption(process.argv.at(-1)),
    };
};

if (require.main == module) {
    (async () => {
        if (process.argv.length < 4) {
            usage();
            process.exit(1);
        }

        await connectDB();

        const { scripts, option } = parseArgs();

        for (const s of scripts) {
            await s[option]();
        }

        process.exit(0);
    })();
}
