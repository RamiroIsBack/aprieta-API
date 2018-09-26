const { ObjectID } = require("mongodb");
const jwt = require("jsonwebtoken");

const { Photo } = require("../../models/Photo");
const { User } = require("../../models/User");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [
  {
    _id: userOneId,
    email: "ramiro@test.com",
    password: "password1",
    tokens: [
      {
        access: "auth",
        token: jwt.sign({ _id: userOneId, access: "auth" }, "abc123").toString()
      }
    ]
  },
  {
    _id: userTwoId,
    email: "kate@test.com",
    password: "password2"
  }
];

const photos = [
  {
    _id: new ObjectID(),
    url: "  mocking up some url for testing   ",
    nombre: "test1"
  },
  {
    _id: new ObjectID(),
    url: "  mocking up some url for testing again  ",
    nombre: "test2"
  }
];

const populatePhotos = done => {
  //this runs before each test to ensure there is nothing in DB
  //and always this 2 elements
  Photo.remove({})
    .then(() => {
      Photo.insertMany(photos);
    })
    .then(() => done());
};

const populateUsers = done => {
  User.remove({})
    .then(() => {
      //insert many wouldent run the middleware
      var userOne = new User(users[0]).save();
      var userTwo = new User(users[1]).save();
      return Promise.all([userOne, userTwo]);
    })
    .then(() => done());
};

module.exports = { photos, populatePhotos, users, populateUsers };
