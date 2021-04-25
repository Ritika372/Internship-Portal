const config = require('config');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const db = config.get('mongo');

let gfs, gridFSBucket;
const connectdb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      promiseLibrary: global.Promise,
    });
    console.log('Mongoose Connected ...');
    // console.log(conn);

    const connection = mongoose.connection.db;

    gridFSBucket = new mongoose.mongo.GridFSBucket(connection, {
      bucketName: 'photos',
    });

    // Init stream
    gfs = Grid(connection, mongoose);
    gfs.collection('photos');
  } catch (err) {
    //console.error(err.message);
    ///Exit code
    process.exit(1);
  }
};

const getGridFSFiles = (id) => {
  return new Promise((resolve, reject) => {
    gfs.files.findOne({ _id: mongoose.Types.ObjectId(id) }, (err, files) => {
      if (err) reject(err);
      // Check if files
      if (!files || files.length === 0) {
        resolve(null);
      } else {
        resolve(files);
      }
    });
  });
};

const createGridFSReadStream = (id) => {
  return gridFSBucket.openDownloadStream(mongoose.Types.ObjectId(id));
};

module.exports = connectdb;
module.exports.getGridFSFiles = getGridFSFiles;
module.exports.createGridFSReadStream = createGridFSReadStream;
