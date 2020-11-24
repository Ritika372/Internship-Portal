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
      return new Promise((resolve ,reject) => {
          // const match = ["image/jpg", "image/jpeg"];
          console.log({file});
          // if (match.indexOf(file.mimetype) === -1) {
          //   reject();
          // }
          console.log('rock');
          resolve({
            bucketName: "photos",
            filename: `${Date.now()}-${file.originalname}`
          });
      } )
    }
});

var uploadFile = multer({ storage: storage });
// var uploadFilesMiddleware = util.promisify(uploadFile);

module.exports = uploadFile;