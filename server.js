require("dotenv").config(); // Configure the env before to use...
require("./helpers/connectDB")(); // Connect to the DB

const app = require("./app");

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Listening on port ", PORT);
    // console.log(app._router);
    // app._router.stack.forEach((e) => {
    //     if (e.name === "router") {
    //         console.log(e.handle);
    //         e.handle.stack.forEach((x) => {
    //             console.log(x.route);
    //         });
    //     }
    // });
});
