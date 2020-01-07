var  moment = require('moment'),
    async = require('async'),
    _ = require('underscore');  


const CategorySchema =  require('../../db/models/category');

var categories = {
    getCategories: function (req, res) {
        console.log("in getcategories")
        var counts = 0;
        async.waterfall([
            function (nextCall) {
                var query1 = {};
                if (req.body.type !== 'all') {
                    var query = {
                        order: [],
                        offset: req.body.offset ? req.body.offset : 0,
                        limit: req.body.limit ? req.body.limit : 10
                    };
                } else {
                    var query = {
                        order: []
                    };
                }

                /*check for sorting data */
                if (req.body.sort && _.keys(req.body.sort).length > 0) {

                    var sortValues = _.values(req.body.sort);
                    var sortField = _.values(req.body.sort)[0].split('.');
                    if (sortField.length > 1) {
                    } else {
                        query.order.push([sortValues[0], sortValues[1]])
                    }

                } else {
                    query.order.push(['_id', 'DESC'])
                }

                /* Check for filter data */ 
                
                // if (req.body.type !== 'all') {                    
                //     query1["is_deleted"] = { $in: [false] };
                // }               
                
                if (req.body.filter && _.keys(req.body.filter).length > 0) {
                    _.map(req.body.filter, function (val, key) {
                        if (key === 'cat_name') {
                            query1["cat_name"] = { $regex: val, $options: 'i' }
                        } else if (key === 'date') {
                            var startDate = moment(val.startDate, "YYYY-MM-DD").startOf('day').toISOString();
                            var endDate = moment(val.endDate, "YYYY-MM-DD").endOf('day').toISOString();
                            query1['createdAt'] = { $gte: startDate, $lt: endDate }
                        }
                    });
                }
                // { status: { $in: [1, 0] } }
                
                CategorySchema.find(query1, { createdAt: 1, cat_name: 1, status: 1, is_deleted: 1 }).sort(query.order).skip(Number(query.offset)).limit(Number(query.limit)).exec(function (err, categoriesList) {
                    if (err) {
                        nextCall('SWW-400', null);
                    }
                    // console.log(categoriesList)
                    var body = {};                  
                    body.rows = categoriesList;
                    nextCall(null, body, query1);
                });
            },
            function (body, query1, nextCall) {
                // console.log(query1,body)
                CategorySchema.count(query1, function (err, counts) {
                    var returnData = {
                        count: counts,
                        rows: body.rows
                    }
                    nextCall(null, returnData);
                });
            }
        ],
            function (err, response) {
                console.log("err", response)
                if (err) {
                    var arr = err.split("-");
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'S',
                    data: response
                })
            }
        );
    },

    getCategory: function (req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('cat_id', 'CIR').notEmpty('');
                var err = req.validationErrors();
                if (err && err.length) {
                    nextCall(err[0].msg + "-400", null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {
                CategorySchema.findOne({ _id: body.cat_id }, { '__v': 0, updated_at: 0, createdAt: 0 }, function (error, catData) {
                    if (catData) {
                        nextCall(null, catData);
                    } else {
                        nextCall('DNF-400', null);
                    }
                })
            }
        ],
            function (err, response) {
                if (err) {
                    var arr = err.split("-");
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'S',
                    data: response
                })
            }
        )
    },

    createCategory: function (req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('cat_name', 'CNIR').notEmpty();               
                req.checkBody('status', 'SIR').notEmpty();

                var err = req.validationErrors();
                if (err && err.length) {

                    nextCall(err[0].msg + '-400', null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {

                CategorySchema.findOne({ cat_name: body.cat_name }, { _id: 1 }, function (err, category) {                   
                    if (err) {
                        nextCall(err[0].MSG + '-400', null);
                    } else if (category) {
                        nextCall('CNAE-400', null);
                    } else {
                        var createCategory = new CategorySchema(body);
                        createCategory.save(function (error, category) {
                            if (error) {
                                nextCall('CHBNC-400', null)
                            } else if (category) {
                                CategorySchema.findOne({ _id: category._id }, { __v: 0 }, function (err, catData) {
                                    nextCall(null, catData)
                                });
                            }
                        });
                    }
                });
                
            }
        ],
            function (err, response) {
                if (err) {
                    var arr = err.split("-");
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }

                return res.sendToEncode({
                    status: 201,
                    message: 'CHBCS',
                    data: response
                })
            });
    },

    updateCategory: function (req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('cat_id', 'MP').notEmpty();
                req.checkBody('cat_name', 'CNIR').notEmpty();                
                req.checkBody('status', 'SIR').notEmpty();

                var error = req.validationErrors();
                if (error && error.length) {
                    nextCall(error[0].msg, null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {
                CategorySchema.findOne({ cat_name: body.cat_name, _id: { $ne: body.cat_id } }, { _id: 1, cat_name: 1 }, function (err, cat) {
                    
                    if(cat){
                        if(cat.cat_name == body.cat_name){
                            nextCall('CNAE-400', null);
                        }
                    } else {
                        CategorySchema.findOne({ _id: body.cat_id }, { _id: 1, cat_name: 1 }, function (err, category) {
                            if (category) {
                                    CategorySchema.update({ _id: body.cat_id }, { $set: { cat_name: body.cat_name,  status: body.status } }, function (err, catData) {
                                        console.log(catData);
                                        if (catData) {
                                            nextCall(null, catData);
                                        } else {
                                            nextCall('CHBNU-400', null);
                                        }
                                    });
                            } else {
                                nextCall('CNF-400', null);
                            }
                        });
                    }
                });

            }
        ],
            function (err, response) {
                if (err) {
                    var arr = err.split("-");
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'CHBUS',
                    data: response
                })
            });
    },

    deleteCategory: function (req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('cat_id', 'CID').notEmpty();
                var err = req.validationErrors();
                if (err && err.length) {
                    nextCall(err[0].msg + '-400', null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {
                CategorySchema.findOne({ _id: body.cat_id }, function (err, category) {
                    if (category) {
                        CategorySchema.update({ _id: body.cat_id }, { $set: { is_deleted: true } }, function (err, catData) {
                            if (catData) {
                                nextCall(null, {});
                            } else {
                                nextCall('CHBND-400', null);
                            }
                        });
                    } else {
                        nextCall('CNF-400', null);
                    }
                });
            }
        ],
            function (err, response) {
                if (err) {
                    var arr = err.split("-");
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }

                return res.sendToEncode({
                    status: 201,
                    message: 'CHBDS',
                    data: response
                })
            });
    },
    
    updateCategoryStatus: function (req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('cat_id', 'CID').notEmpty();
                req.checkBody('status', 'SIR').notEmpty();
                var err = req.validationErrors();
                if (err && err.length) {
                    nextCall(err[0].msg + '-400', null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {
                CategorySchema.findOne({ _id: body.cat_id }, function (err, category) {
                    if (category) {
                        CategorySchema.update({ _id: body.cat_id }, { $set: { status: body.status } }, function (err, catData) {
                            if (catData) {
                                nextCall(null, body);
                            } else {
                                nextCall('CSHBNU-400', null);
                            }
                        });
                    } else {
                        nextCall('CNF-400', null);
                    }
                });
            }
        ],
            function (err, response) {
                if (err) {
                    var arr = err.split("-");
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'CSHBUS',
                    data: response
                })
            });
    }
}

module.exports = categories;