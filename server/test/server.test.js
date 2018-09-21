const expect = require("expect");
const request = require("supertest");

const { app } = require("../../server/server");
const { Photo } = require("../models/Photo");

const photos = [
  {
    url: "  mocking up some url for testing   ",
    nombre: "test1"
  },
  {
    url: "  mocking up some url for testing again  ",
    nombre: "test2"
  }
];

beforeEach(done => {
  //this runs before each test to ensure there is nothing in DB
  Photo.remove({})
    .then(() => {
      Photo.insertMany(photos);
    })
    .then(() => done());
});

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
