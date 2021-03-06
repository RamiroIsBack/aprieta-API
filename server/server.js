const _ = require("lodash");
const express = require("express");
const bodyParser = require("body-parser");
const { ObjectID } = require("mongodb");

const { portAndMongodConfig } = require("./config/config");
var { connectWithDBThroughMongoose } = require("./db/mongoose");
var { Photo } = require("./models/Photo");
var { User } = require("./models/User");
var { authenticateMiddleware } = require("./middleware/authenticate");

console.log("enviroment: ", portAndMongodConfig());
connectWithDBThroughMongoose()
  .then(message => console.log("connecting: ", message))
  .catch(e => console.log("error while connecting: ", e));

var app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
//routes on an restApi are normally
//Create(post) R A D
app.post("/photos", authenticateMiddleware, (req, res) => {
  var newPhoto = new Photo({
    nombre: req.body.nombre,
    url: req.body.url,
    userId: req.user._id
  });
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
    return res.status(404).send();
  }
  Photo.findById(id)
    .then(photo => {
      if (!photo) {
        res.status(404).send();
      } else {
        res.status(200).send({ photo });
      }
    })
    .catch(e => res.status(400).send());
});
app.delete("/photos/:id", authenticateMiddleware, (req, res) => {
  let id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  Photo.findOneAndRemove({
    _id: id,
    userId: req.user._id
  })
    .then(photo => {
      if (!photo) {
        res.status(404).send();
      } else {
        res.status(200).send({ photo });
      }
    })
    .catch(e => res.status(400).send());
});
app.patch("/photos/:id", authenticateMiddleware, (req, res) => {
  var id = req.params.id;

  var body = _.pick(req.body, ["nombre", "url"]);
  if (!body.nombre && !body.url) {
    return res.status(400).send();
  }
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  body.updatedAt = new Date().toString();
  Photo.findOneAndUpdate(
    { _id: id, userId: req.user._id },
    { $set: body },
    { new: true }
  )
    .then(photo => {
      if (!photo) {
        return res.status(404).send();
      }
      res.send(photo);
    })
    .catch(e => res.status(400).send());
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

app.get("/users/me", authenticateMiddleware, (req, res) => {
  res.send(req.user);
});

app.post("/users/login", (req, res) => {
  var { email, password } = req.body;
  User.findByCredentials({ email, password })
    .then(user => {
      user.generateAuthToken().then(token => {
        res.header("x-auth", token).send(user);
      });
    })
    .catch(e => {
      res.status(400).send(e);
    });
});
app.delete("/users/me/token", authenticateMiddleware, (req, res) => {
  req.user
    .removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch(e => res.status(400).send());
});

app.listen(port, () => {
  console.log(`start on port ${port}`);
});
module.exports = { app };
