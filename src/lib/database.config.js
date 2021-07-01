import mongoose from 'mongoose';
// const URI = "mongodb://127.0.0.1:27017/testing-api"
const URI = "mongodb+srv://year-3-dev-2021:year3dev@conference-api.hfqud.mongodb.net/conference_db?retryWrites=true&w=majority&ssl=true";
let database;

module.exports = {
  connectToDatabseServer: function(callback) {
    mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: true }, (error, db) => {
      database = db
      return callback(error);
    });
  },

  getDatabase: function() {
    return database;
  }
}