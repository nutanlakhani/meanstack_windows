var express = require('express');
var router = express.Router();
var UserSchema = require('../api/controllers/user')

/* GET home page. */
router.post('/login', UserSchema.login);
router.post('/register', UserSchema.register);
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
