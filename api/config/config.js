const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.join(__dirname, "..", ".env")
});

const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "local";

if (process.env.VERCEL_ENV !== "production") {

    dotenv.config({
        path: path.join(__dirname, "..", `.env.${env}`)
    });

}

console.log(`Environment: ${process.env.NODE_ENV}`);