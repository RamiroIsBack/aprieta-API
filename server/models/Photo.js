var mongoose = require("mongoose");
var Photo = mongoose.model("Photo", {
  url: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  nombre: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  updatedAt: {
    type: String,
    default: new Date().toString()
  }
});

module.exports = { Photo };
