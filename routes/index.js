var express = require('express');
var router = express.Router();
var UserSchema = require('../api/controllers/user')

/* GET home page. */
router.post('/login', UserSchema.login);
/*Without file upload */
router.post('/register', UserSchema.register);
router.post('/logout', UserSchema.logout);
router.post('/addUser', UserSchema.addUser);
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
