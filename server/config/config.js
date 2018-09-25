module.exports.portAndMongodConfig = () => {
  var env = process.env.NODE_ENV || "development";
  if (env === "development") {
    //PORT is not set so will take the default that is 3000
    //we still wanna use mongolab instead of localhost first for now so don't pass env.MONGODB_URI
  } else if (env === "test") {
    process.env.PORT === 3000;
    process.env.MONGODB_URI = "mongodb://localhost:27017/Aprieta-test";
  } else if (env === "production") {
    // PORT set aoutomaticly by heroku
    //MONGODB_URI not automatic cos heroku wanted me to pay for the addon.
  }
  return env;
};
