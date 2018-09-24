var express = require("express");
var bodyParser = require("body-parser");
var { ObjectID } = require("mongodb");

var { mongoose } = require("./db/mongoose");
var { Photo } = require("./models/Photo");
var { User } = require("./models/User");

var app = express();
const port = process.env.PORT || 3000;
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
app.get("/photos/:id", (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  Photo.findById(id)
    .then(photo => {
      if (!photo) {
        res.status(404).send({});
      } else {
        res.status(200).send({ photo });
      }
    })
    .catch(e => res.status(400).send({}));
});
app.delete("/photos/:id", (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  Photo.findByIdAndRemove(id)
    .then(doc => {
      if (!doc) {
        res.status(404).send({});
      } else {
        res.status(200).send({ doc });
      }
    })
    .catch(e => res.status(400).send({}));
});

app.listen(port, () => {
  console.log(`start on port ${port}`);
});
module.exports = { app };
