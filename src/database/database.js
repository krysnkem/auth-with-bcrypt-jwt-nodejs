
const mongoose = require('mongoose')

async function connectDB(uri){

    try {
        mongoose.connect(uri || process.env.MONGO_DB_LOCAL)
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = connectDB