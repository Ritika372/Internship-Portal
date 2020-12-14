const util = require("util");
const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const config = require("config");
const mongoose = require("mongoose");
const db = config.get("mongo");

var storage = new GridFsStorage({
  url: db,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        // In here you have access to the request and also to the body object
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'photos'
        };
        resolve(fileInfo);
      });
    });
  }
});



var uploadFile = multer({ storage: storage });
// var uploadFilesMiddleware = util.promisify(uploadFile);

module.exports = uploadFile
