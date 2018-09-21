var { mongoose } = require("./db/mongoose");
var express = require("express");
var bodyParser = require("body-parser");

var { Photo } = require("./models/Photo");
var { User } = require("./models/User");

var app = express();
app.use(bodyParser.json());
//routes on an restApi are normally
//Create(post) R A D
app.post("/photos", (req, res) => {
  var newPhoto = new Photo(req.body);
  newPhoto
    .save()
    .then(doc => {
      res.send(doc);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});
app.get("/photos", (req, res) => {
  Photo.find().then(
    photos => {
      res.send({ photos, more: "more data in the future" }); //sending the array within an object we prepare to be able to send more data later on if we need it
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.listen(3000, () => {
  console.log("start on port 3000");
});
module.exports = { app };
// var newUser = new User({
//   email: "ramiroHatesAmazon@amazonsucks.com"
// });
// newUser.save().then(
//   doc => {
//     console.log(doc);
//   },
//   err => console.log(err)
// );
