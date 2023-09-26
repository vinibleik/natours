const mongoose = require("mongoose");

let DB_URI = "";

if (process.env.NODE_ENV === "development") {
    DB_URI = process.env.MONGODB_URI_LOCAL;
} else {
    DB_URI = process.env.MONGODB_URI_ATLAS.replace(
        "<password>",
        process.env.MONGODB_URI_ATLAS_PASSWORD,
    );
}
DB_URI = DB_URI.replace("<db_name>", process.env.DB_NAME);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(DB_URI, {
            //   options to prevent warnings
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(
            `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
        );
    } catch (error) {
        console.error(`DB connection Error: ${error}`);
        process.exit(1);
    }
};

module.exports = connectDB;
