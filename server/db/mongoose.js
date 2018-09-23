var mongoose = require("mongoose");

//to start mongo db type this in the terminal:
//ramiro@c3po:~/mongo/bin$ ./mongod --dbpath ~/mongo-data

mongoose.Promise = global.Promise;
mongoose.connect(
  "mongodb://<RamiroIsBack>:<Albamola2017>@ds111993.mlab.com:11993/photo-api" ||
    "mongodb://localhost:27017/Aprieta",
  { useNewUrlParser: true }
);

module.exports = { mongoose };
