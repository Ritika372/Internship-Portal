const util = require("util");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const config =  require("config");
const mongoose = require("mongoose");
const db = config.get("mongo");
var storage = new GridFsStorage({
    url: db,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/jpg", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-${file.originalname}`
    };
  }
});

var uploadFile = multer({ storage: storage }).single("file");
var uploadFilesMiddleware = util.promisify(uploadFile);
module.exports = uploadFilesMiddleware;