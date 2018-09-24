var mongoose = require("mongoose");

//to start mongo db type this in the terminal:
//ramiro@c3po:~/mongo/bin$ ./mongod --dbpath ~/mongo-data

mongoose.Promise = global.Promise;

mongoose
  .connect(
    "mongodb://ramiro:password2@ds111993.mlab.com:11993/photo-api" ||
      "mongodb://localhost:27017/Aprieta",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("conected to mongolab");
  })
  .catch(e => {
    console.log("something went wrong connecting to mongolab: ", e);
  });

module.exports = { mongoose };
