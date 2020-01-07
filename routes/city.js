var express = require('express');
var router = express.Router();
var CitySchema = require('../api/controllers/city')

/* GET users listing. */
router.post('/list', CitySchema.getAllCity);
router.post('/add', CitySchema.addCity);
router.delete('/delete', CitySchema.deleteCity);
router.get('/', CitySchema.getCities);

module.exports = router;
