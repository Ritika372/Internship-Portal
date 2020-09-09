const config =  require("config");
const mongoose = require("mongoose");
const db = config.get("mongo");
const connectdb = async() => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        console.log('Mongoose Connected ...');
    } catch (err) {
        console.error(err.message);
        ///Exit code
        process.exit(1);
    }
}

module.exports = connectdb;