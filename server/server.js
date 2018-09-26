const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { portAndMongodConfig } = require("./config/config");
var { connectWithDBThroughMongoose } = require("./db/mongoose");
var { Photo } = require("./models/Photo");
var { User } = require("./models/User");
var { authenticate } = require("./middleware/authenticate");

console.log("enviroment: ", portAndMongodConfig());
connectWithDBThroughMongoose()
  .then(message => console.log("connecting: ", message))
  .catch(e => console.log("error while connecting: ", e));

var app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
//routes on an restApi are normally
//Create(post) R A D
app.post("/photos", (req, res) => {
  let body = Object.assign({}, req.body);
  var newPhoto = new Photo(body);
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
    .then(photo => {
      if (!photo) {
        res.status(404).send({});
      } else {
        res.status(200).send({ photo });
      }
    })
    .catch(e => res.status(400).send({}));
});
app.patch("/photos/:id", (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ["nombre", "url"]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send({});
  }
  body.updatedAt = new Date().toString();
  Photo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then(photo => {
      if (!photo) {
        return res.status(404).send({});
      }
      res.send(photo);
    })
    .catch(e => res.status(400).send({}));
});

//users
app.post("/users", (req, res) => {
  let body = _.pick(req.body, ["email", "password"]);
  var newUser = new User(body);
  //
  newUser
    .save()
    .then(() => {
      return newUser.generateAuthToken();
    })
    .then(token => res.header("x-auth", token).send(newUser))
    .catch(e => res.status(400).send(e));
});

app.get("/users/me", authenticate, (req, res) => {
  res.send(req.user);
});

app.listen(port, () => {
  console.log(`start on port ${port}`);
});
module.exports = { app };
