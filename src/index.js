//for lauching the app using express
/**
 * Tools needed: express, app from express, port,
 */

//importing all tools
const express = require("express");
const { json } = require("express");
const app = express();
const staffRoutes = require("./routes/staffRoutes");
const managerRoutes = require("./routes/managerRoutes");
const adminRoutes = require("../src/routes/adminRoutes");
const { config } = require("dotenv");
const connectDB = require("../src/database/database");

//load the environment variables in the .env file
config();

//seeders
const { seedAdmin } = require("../seeders/admin");
// console.log(seedAdmin());

//json middleware
app.use(json());
app.use("/staff", staffRoutes);
app.use("/manager", managerRoutes);
app.use("/admin", adminRoutes);

//connect the database
connectDB()
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => {
    console.log(err.message);
  });

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running at port: ${port}`);
});
