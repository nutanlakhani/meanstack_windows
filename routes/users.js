var express = require('express');
var router = express.Router();
var multer  = require('multer');
var UserSchema = require('../api/controllers/user')
var verifyToken = require('./middleware');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    
    console.log("file",file);
    let fileNew = file.originalname.split('.');
    if (fileNew.length == 2) {
      cb(null, fileNew[0] + '-' + Date.now()+'.'+ fileNew[1])
    } else {
      cb(null, file.fieldname + '-' + Date.now())
    }    
  }
})
 
var upload = multer({ storage: storage});
router.post('/register', upload.single('profile'), UserSchema.register);
router.post('/getUser', verifyToken, UserSchema.getUser);
router.post('/update',  upload.single('profile'), UserSchema.updateUser);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
