var debug = require('debug')('x-code:v1:controllers:Dashboard'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
        _ = require('underscore'),
        MSG = require('../../message_admin.js'),
        config = rootRequire('./config/global.js'),
        ED = rootRequire('services/encry_decry'),
        DS = rootRequire('services/date');


const FolderSchema = rootRequire('db/mongodb/Folders');
const ArtSchema = rootRequire('db/mongodb/Arts');
var mongoose = require('mongoose'),
ObjectId = mongoose.Types.ObjectId;

var dashboard = {
    getArtistFolders: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('artist_id', 'AIIR').notEmpty('');
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {                    
                    FolderSchema.aggregate([
                        {
                            $match: {
                                "artist_id": ObjectId(body.artist_id),
                                "status": true
                            }
                        },
                        {
                            $lookup: {
                                "from" : "arts",
                                "localField" : "_id",
                                "foreignField" : "folder_id",
                                "as" : "artInfo"
                            }
                        },
                        {
                            $unwind: {
                                path : "$artInfo",
                                includeArrayIndex: "arrayIndex",   
                                preserveNullAndEmptyArrays : true // optional
                            }
                        },
                        {
                            $match:{
                                $or:[ 
                                     {'artInfo.status':true},
                                     {'arrayIndex': null}
                                   ]
                              }
                        },
                        {
                            $group: {
                                "_id": "$_id",
                                "name": {
                                    "$first": "$name"
                                },
                                "completed_upload": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$artInfo.completed_upload", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                "total": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$artInfo.status", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        },
                        { $sort: {
                            "_id" : -1, 
                        } }
                        
                    ]).exec(function (err, folderList) {
                        if (err) {
                            return nextCall('SWW-400', null);
                        }
                        nextCall(null, folderList);
                    });
                    // FolderSchema.find({
                    //     'artist_id': body.artist_id,
                    //     'status': true
                    // }, {
                    //     created_at: 1,
                    //     name: 1                      
                    // }).exec(function (err, folderList) {
                    //     if (err) {
                    //         return nextCall('SWW-400', null);
                    //     }
                    //     nextCall(null, folderList);
                    // });
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
        );
    },
    getArtProgressCount: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('artist_id', 'AIIR').notEmpty('');
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    console.log("body",body);
                    var matchData = {
                        $and: [{
                                "artist_id": {
                                    $eq: ObjectId(body.artist_id)
                                }
                            },
                            {
                                "status": {
                                    $eq: true
                                }
                            }
                        ]
                    };
                    if (body.user_type === 'admin') {
                        matchData = {
                            "status": {
                                $eq: true
                            }
                        }
                    }

                    ArtSchema.aggregate([
                        {
                            $match: matchData
                        },
                        {
                            $group: {
                                "_id": null,                                
                                "completed_upload": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$completed_upload", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                "pending_review": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$pending_review", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                "files_converted_to_png": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$files_converted_to_png", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                "products_created": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$products_created", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                "products_uploaded": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$products_uploaded", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                },
                                "product_live": {
                                    "$sum": {
                                        "$cond": [{
                                                "$eq": ["$product_live", true]
                                            },
                                            1,
                                            0
                                        ]
                                    }
                                }
                            }
                        }
                    ]).exec(function (error, artList) {                       
                        nextCall(null, artList);
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
                    message: 'S',
                    data: response
                })
            }
        );
    },
    getFolderArt: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('folder_id', 'FIIR').notEmpty('');
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    ArtSchema.find({
                        'folder_id': body.folder_id
                    }).select({
                        'title': 1,
                        'file': 1,
                        '_id': 1,
                        'created_at': 1,
                        'status': 1,
                        'category_id': 1
                    }).populate('category_id', 'cat_name').exec(function (err, userData) {
                        console.log("userData", userData);
                        nextCall(null, userData);
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
                    message: 'S',
                    data: response
                })
            }
        );
    }


}

module.exports = dashboard;