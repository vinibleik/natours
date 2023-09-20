const { readFileSync } = require("fs");
const express = require("express");
const { join } = require("path");

const app = express();

const tours = JSON.parse(
    readFileSync(join(__dirname, "/dev-data/data/tours-simple.json")),
);

app.get("/api/v1/tours", (req, res) => {
    res.json({ status: "success", results: tours.length, data: { tours } });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Listening on port ", PORT);
});
