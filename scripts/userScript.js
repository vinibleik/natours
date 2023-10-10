require("dotenv").config();

const { readFile } = require("fs/promises");
const User = require("../models/userModel");
const connectDB = require("../helpers/connectDB");
const { join } = require("path");

const getUsers = async () => {
    try {
        const pathToData = join(__dirname, "../dev-data/data/users.json");
        const users = await readFile(pathToData, { encoding: "utf8" });
        return JSON.parse(users);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const importUsers = async () => {
    try {
        const users = await getUsers();
        await User.create(users);
        console.log("Users inserted successfully!!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const deleteUsers = async () => {
    try {
        await User.deleteMany();
        console.log("All Users deleted!");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const usage = () => {
    console.log(`node ${__filename} option`);
    console.log("option:");
    console.log("\t--import -> Import all the data User into DB");
    console.log("\t--delete -> Delete all the data User into DB");
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
            await importUsers();
        } else {
            await deleteUsers();
        }
        process.exit(0);
    })();
}

module.exports = {
    import: importUsers,
    delete: deleteUsers,
};
