var express = require('express');
var router = express.Router();
var CategoryContoller = require('../api/controllers/category')
var verifyToken = require('./middleware');

/* GET users listing. */

router.all('/*', function(req, res, next) {
    res.sendToEncode = function(data) {
        res.send(data)
        next();
    };
    next();
});
router.all('/*', verifyToken);
router.post('/getCategory', CategoryContoller.getCategory);
router.post('/createCategory', CategoryContoller.createCategory);
router.post('/updateCategory', CategoryContoller.updateCategory);
router.post('/deleteCategory', CategoryContoller.deleteCategory);
router.post('/updateCategoryStatus', CategoryContoller.updateCategoryStatus);
router.post('/getCategories', CategoryContoller.getCategories);

module.exports = router;



