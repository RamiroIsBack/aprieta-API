const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");

const { app } = require("../../server/server");
const { Photo } = require("../models/Photo");
const { User } = require("../models/User");
const { photos, users, populatePhotos, populateUsers } = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populatePhotos);

describe("POST /photos", () => {
  it("should create a new photo", done => {
    var url = "some url for the photo         ";
    var nombre = "photoTest1    ";
    request(app)
      .post("/photos")
      .send({ url, nombre })
      .expect(200)
      .expect(res => {
        expect(res.body.url).toBe(url.trim());
        expect(res.body.nombre).toBe(nombre.trim());
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Photo.find({ nombre })
          .then(photos => {
            expect(photos.length).toBe(1); //cos we only created one
            expect(photos[0].nombre).toBe(nombre.trim());
            expect(photos[0].url).toBe(url.trim());
            done();
          })
          .catch(e => done(e));
      });
  });
  it("should not create a photo with invalid body data", done => {
    request(app)
      .post("/photos")
      .send({}) //sending an empty object
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Photo.find()
          .then(photos => {
            expect(photos.length).toBe(2);
            done();
          })
          .catch(e => done(e));
      });
  });
});

describe("Get /photos", () => {
  it("should get all photos", done => {
    request(app)
      .get("/photos")
      .expect(200)
      .expect(res => {
        expect(res.body.photos.length).toBe(2);
      })
      .end(done);
  });
});
describe("Get /photos/:id", () => {
  it("should return photo doc", done => {
    request(app)
      .get(`/photos/${photos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.photo.nombre).toBe(photos[0].nombre);
      })
      .end(done);
  });
  it("should return 404 if photo not found", done => {
    // let modifiedId = photos[0]._id.toHexString();
    // modifiedId = modifiedId.replace(modifiedId.charAt(0), "4");
    let modifiedId = new ObjectID().toHexString();
    request(app)
      .get(`/photos/${modifiedId}`)
      .expect(404)
      .end(done);
  });
  it("should return 404 if id is invalid", done => {
    let invalidId = `123${photos[0]._id.toHexString()}`;
    request(app)
      .get(`/photos/${invalidId}`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /photos/:id", () => {
  it("sould remove a photo", done => {
    var hexId = photos[1]._id.toHexString();
    request(app)
      .delete(`/photos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.photo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Photo.findById(hexId)
          .then(photo => {
            expect(photo).toBeFalsy();
            done();
          })
          .catch(e => done(e));
      });
  });
  it("should return 404 if photo not found", done => {
    let hexId = new ObjectID().toHexString();
    request(app)
      .delete(`/photos/:${hexId}`)
      .expect(404)
      .end(done);
  });
  it("should return 404 if id is invalid", done => {
    let wrongId = "442452";
    request(app)
      .delete(`/photos/:${wrongId}`)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /photos/:id", () => {
  it("should update the photo", done => {
    let hexId = photos[0]._id.toHexString();

    let nombre = "testing patching";
    let url = "ouyeahhh test this url";

    request(app)
      .patch(`/photos/${hexId}`)
      .send({ nombre, url })
      .expect(200)
      .expect(res => {
        expect(res.body.nombre).toBe(nombre);
        expect(res.body.url).toBe(url);
      })
      .end(done);
  });
});
describe("GET /user/me", () => {
  it("should return user if authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect(res => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });
  it("has to return 401 if not authenticated", done => {
    request(app)
      .get("/users/me")
      .set("x-auth", "sdfsdf")
      .expect(401)
      .expect(res => expect(res.body).toEqual({}))
      .end(done);
  });
});
describe("POST /users", () => {
  it("should create a user", done => {
    var email = "example@gmail.com";
    var password = "password";
    request(app)
      .post("/users")
      .send({ email, password })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end(err => {
        if (err) {
          return done(err);
        }
        User.findOne({ email })
          .then(user => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password); //should have been hashed
            done();
          })
          .catch(e => done(e));
      });
  });
  it("should return validation errors if request invalid", done => {
    request(app)
      .post("/users")
      .send({ email: "invalidEmail", password: "short" })
      .expect(400)
      .end(done);
  });
  it("should not create user if password is in use", done => {
    request(app)
      .post("/users")
      .send({ email: users[1].email, password: "lkdsffsfsdd" })
      .expect(400)
      .end(done);
  });
});
describe("POST /users/login", () => {
  it("should login a user and return auth token", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens[0]).toMatchObject({
              access: "auth",
              token: res.headers["x-auth"]
            });
            done();
          })
          .catch(e => done(e));
      });
  });
  it("should reject invalid login", done => {
    request(app)
      .post("/users/login")
      .send({
        email: users[1].email,
        password: "dddddddsf"
      })
      .expect(400)
      .expect(res => {
        expect(res.headers["x-auth"]).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[1]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => done(e));
      });
  });
});
describe("DELETE /users/me/token", () => {
  it("should remove auth token on logout", done => {
    request(app)
      .delete("/users/me/token")
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        User.findById(users[0]._id)
          .then(user => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch(e => {
            return done(e);
          });
      });
  });
});
