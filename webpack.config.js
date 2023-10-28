const path = require("path");

module.exports = {
    entry: "./public/scripts/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "public", "dist"),
    },
    module: {
        rules: [
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                        ],
                    },
                },
            },
        ],
    },
};
