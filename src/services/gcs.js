const { v4: uuid } = require('uuid');
const { extname } = require('path');
const storage = require('../config/storage');

function getFileExtension(filename) {
  return extname(filename);
}

const uploadImage = (imageFile) =>
  new Promise((resolve, reject) => {
    const { buffer, originalname } = imageFile;

    // Get received a file extension
    const fileName = `${getFileExtension(originalname).toLowerCase()}`;

    // The new ID of GCS file
    const destFileName = `cloud-${uuid()}${fileName}`;

    // Get a reference to the bucket
    const myBucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

    // Create a reference to a file object
    const file = myBucket.file(destFileName);

    // write stream (save the file in gc)
    const fileStream = file.createWriteStream({
      resumable: false,
    });

    fileStream
      .on('finish', () => {
        const url = `https://storage.googleapis.com/${myBucket.name}/${file.name}`;
        resolve(url);
      })
      .on('error', (err) => {
        reject(err);
      })
      .end(buffer);
  });

module.exports = uploadImage;
