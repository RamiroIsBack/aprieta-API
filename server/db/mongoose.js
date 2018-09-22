var mongoose = require("mongoose");

//to start mongo db type this in the terminal:
//ramiro@c3po:~/mongo/bin$ ./mongod --dbpath ~/mongo-data

mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MongoDB_URI || "mongodb://localhost:27017/Aprieta"
);

module.exports = { mongoose };
