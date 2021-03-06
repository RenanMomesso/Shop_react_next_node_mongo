const app = require("./app");
const connectDatabase = require("./config/database");


const dotenv = require("dotenv");


// handle Uncaught exceptions
process.on('uncaughtException', err => {
  console.log(`ERROR: ${err.stack}`)
  console.log("Shutting down server due to uncaught exception");
  process.exit(1)
})

//setting up config file
dotenv.config({ path: "config/config.env" });


// Connecting to database
connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(
    "SERVER STARTED ON: " +
      process.env.PORT +
      " in " +
      process.env.NODE_ENV +
      " mode "
  );
});

//handle Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`ERROR: ${err.message}`);
  console.log("Shutting down server due to Unhandled Promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});
