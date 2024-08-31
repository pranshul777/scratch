const multer  = require('multer');
const path = require("path");
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// console.log("here");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("dest");
      cb(null, path.join(__dirname, '../public/temp'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});
  
const upload = multer({ storage: storage });



module.exports = upload;