var debug = require('debug')('x-code:v1:controllers:user'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
        _ = require('underscore'),
        MSG = require('../../message_admin.js'),
        config = rootRequire('./config/global.js'),
        ED = rootRequire('services/encry_decry'),
        Uploader = rootRequire('support/uploader'),
        Mailer = rootRequire('support/mailer'),
        DS = rootRequire('services/date');
const path = require('path');
const ejs = require('ejs');


const AdminSchema = rootRequire('db/mongodb/Admin');
const UserSchema = rootRequire('db/mongodb/Users');
const NotificationSchema = rootRequire('db/mongodb/Notifications');
var randomstring = require("randomstring");

var users = {
    register: function (req, res) {
        async.waterfall([
            function (nextCall) {
                Uploader.getFormFields(req, nextCall);
            },
            function (fields, files, nextCall) {
                console.log(files);
                if (!fields.first_name) {
                    nextCall('FIR-400', null);
                } else if (!fields.last_name) {
                    nextCall('LIR-400', null);
                } else if (!fields.email) {
                    nextCall('EIR-400', null);
                } else if (!fields.password) {
                    nextCall('PIR-400', null);
                } else if (!fields.phone) {
                    nextCall('PNIR-400', null);
                } else if (!files['profile_picture']) {
                    nextCall('PPIR-400', null);
                } else {
                    nextCall(null, fields, files);
                }
            },
            function (fields, files, nextCall) {
                UserSchema.findOne({
                    email: fields.email
                }, {
                    _id: 1
                }, function (err, user) {
                    if (err) {
                        nextCall(err[0].MSG + '-400', null);
                    } else if (user) {
                        nextCall('EIAE-400', null);
                    } else {
                        nextCall(null, fields, files);
                    }
                });
            },
            function (fields, files, nextCall) {

                imageFile = files['profile_picture'].path;

                var ext = path.extname(files['profile_picture'].name);
                var imageFile = `uploads/profile_pictures/${DS.getTime()}${ext}`;
                Uploader.upload({
                        src: files['profile_picture'].path,
                        dst: rootPath + "/" + imageFile
                    },
                    function () {
                        fields.profile_picture = imageFile;
                        nextCall(null, fields)
                    }
                );
            },
            function (body, nextCall) {
                body.password = ED.encrypt(body.password);
                body.support_id = randomstring.generate({ length: 4,charset: 'alphabetic', capitalization:'uppercase'}); 
                // body.confirmation = true;               
                UserSchema.findOne({support_id: body.support_id},{_id:1}, function(err, supportId){                    
                    if(supportId){
                        body.support_id = randomstring.generate({ length: 4,charset: 'alphabetic', capitalization:'uppercase'});
                    } 
                })
                var createUser = new UserSchema(body);
                createUser.save(function (error, user) {                   
                    if (error) {
                        nextCall('UHBNC-400', null);
                    } else if (user) {
                        AdminSchema.findOne({'reporting': true }, {
                            email: 1,                            
                            first_name:1, 
                            last_name:1                            
                        }, function (err1, admin) {

                            if(admin){

                                async.parallel([
                                    function(thanksCallback){
                                        /* Send Email to Register user */
                                        ejs.renderFile(__dirname +'/../../../views/templates/thankyou.html', {
                                            config: config									
                                        }, {}, function(err, html) {
                                            if (err) {
                                                console.log("in ej error",err)
                                            }
                                            // console.log("html",html);
                                            Mailer.customMail({
                                                to: body.email,
                                                // bcc: admin.email,
                                                from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                                subject: 'Thanks for applying',
                                                html: html

                                            }, function (err, info) {
                                                console.log("err",err);
                                                console.log("info",info);
                                                thanksCallback(null, true);
                                            });
                                        });
                                    },
                                    
                                    function(registerCallback){
                                         // send email to admin 
                                         ejs.renderFile(__dirname +'/../../../views/templates/artist-register.html', {
                                            config: config,
                                            email:body.email, 
                                            userName: admin.first_name +' '+ admin.last_name									
                                        }, {}, function(err, html) {
                                            if (err) {
                                                console.log("in ej error",err)
                                            }
                                            // console.log("html",html);
                                            Mailer.customMail({
                                                to: admin.email,
                                                // bcc: admin.email,
                                                from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                                subject: 'New artist register',
                                                html: html

                                            }, function (err, info) {
                                                console.log("err",err);
                                                console.log("info",info);
                                                if (err) {                      
                                                    registerCallback(true, null);
                                                } else {                                
                                                    var data = {};
                                                    registerCallback(null, true);
                                                }
                                                
                                            });
                                        });     
                                    }                
                                        // var html = '<tbody>';
                                        // html += '<tr>';
                                        // html += '<td style="padding: 50px 10px 10px;font-size: 18px;">' + MSG['HA'] + '</td>';
                                        // html += '</tr>';
                                        // html += '<tr>';
                                        // html += '<td style="padding: 10px 50px 40;font-size: 16px;">'+MSG['ARM'] +'</td>';
                                        // html += '<tr><td></td></tr>';
                                        // html += '</tbody>';
                                        // Mailer.mail({
                                        //     to: admin.email,//config.mailOptions.auth.user, 
                                        //     from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                        //     subject: 'New artist register',
                                        //     html: html,                                    
                                        // }, function (err, info) {
                                        //     if (err) {                      
                                        //         return nextCall('MSE' + '-400', null);
                                        //     } else {                                
                                        //         var data = {};
                                        //         nextCall(null, data);
                                        //     }
                                        // });
                                        // var html = '<tbody>';
                                        // html += '<tr>';
                                        // html += '<td style="padding: 50px 10px 10px;font-size: 18px;"> Hello ' +body.first_name +' '+ body.last_name+',</td>';
                                        // html += '</tr>';
                                        // html += '<tr>';
                                        // html += '<td style="padding: 10px 50px 40;font-size: 16px;">'+MSG['TAM'] +'</td>';
                                        // html += '<tr><td></td></tr>';
                                        // html += '</tbody>';
                                        // Mailer.mail({
                                        //     to: body.email,
                                        //     // bcc: admin.email,
                                        //     from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                        //     subject: 'Thanks for applying',
                                        //     html: html,
                                        //     language: req.headers.language
                                        // }, function (err, info) {
                                        // console.log("err",err);
                                        // console.log("info",info);
                                        // });
                                    
                                ],  
                                function(finalErr, finalRes){
                                    if(finalErr){
                                        return nextCall('MSE' + '-400', null);
                                    } else {
                                        var data = {};
                                        nextCall(null, data);
                                    }
                                });
                                
                            } else {
                                nextCall(null, user);
                            }
                            
                        });                       
                    }
                })
            }
        ], function (err, response) {
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
                message: 'UHBCS',
                data: response
            })
        });
    },
    deleteUser: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('user_id', 'UIIR').notEmpty('');
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    UserSchema.findOne({
                        _id: body.user_id
                    }).select({
                        'first_name': 1
                    }).exec(function (err, userData) {
                        if (userData) {
                            UserSchema.update({
                                _id: body.user_id
                            }, {
                                'is_deleted': true,
                                'access_token':''
                            }, function (blockErr, user) {
                                if (user) {
                                    nextCall(null, body)
                                } else {
                                    nextCall('UHBND-400', null);
                                }
                            })
                        } else if (err && err.length) {
                            nextCall(err[0].msg + "-400", null);
                        } else {
                            nextCall('UNF-400', null)
                        }
                    });
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }
                return res.sendToEncode({
                    status: 200,
                    message: 'UHBDS',
                    data: response
                })
            })
    },

    getUsers: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    var query1 = {};
                    var query = {
                        order: [],
                        offset: req.body.offset ? req.body.offset : 0,
                        limit: req.body.limit ? req.body.limit : config.LimitPerPage
                    };

                    /*check for sorting data */
                    if (req.body.sort && _.keys(req.body.sort).length > 0) {

                        var sortValues = _.values(req.body.sort);
                        var sortField = _.values(req.body.sort)[0].split('.');
                        if (sortField.length > 1) {} else {
                            query.order.push([sortValues[0], sortValues[1]])
                        }

                    } else {
                        query.order.push(['status', 'DESC'])
                        query.order.push(['_id', 'DESC'])
                    }

                    query1["is_deleted"] = {
                        $eq: false
                    };                    

                    if (req.body.filter && _.keys(req.body.filter).length > 0) {

                        _.map(req.body.filter, function (val, key) {
                            if (key === 'date') {
                                var startDate = moment(val.startDate, "YYYY-MM-DD").startOf('day').toISOString();
                                var endDate = moment(val.endDate, "YYYY-MM-DD").endOf('day').toISOString();
                                query1['created_at'] = {
                                    $gte: startDate,
                                    $lt: endDate
                                }
                            } else {
                                // if (key === 'name') {
                                query1[key] = {
                                    $regex: val,
                                    $options: 'i'
                                }
                                // } 
                            }
                        });
                    }

                    UserSchema.find(query1).select({
                        password:0,
                        __v:0,
                        access_token:0,
                        reset_token:0,                        
                        updated_at:0
                    }).sort(query.order).skip(Number(query.offset)).limit(Number(query.limit)).exec(function (err, userData) {
                        var body = {};
                        body.rows = userData;
                        nextCall(null, body, query1);
                    });
                },
                function (body, query1, nextCall) {
                    UserSchema.count(query1).exec(function (err, counts) {

                        var returnData = {
                            count: counts,
                            rows: body.rows
                        }
                        nextCall(null, returnData);
                    });

                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
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
    updateUserStatus: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('user_id', 'UIIR').notEmpty('');
                    req.checkBody('status', 'SIR').notEmpty('');
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    UserSchema.findOne({
                        _id: body.user_id
                    }).select({
                        'first_name': 1
                    }).exec(function (err, userData) {
                        if (userData) {
                            UserSchema.update({
                                _id: body.user_id
                            }, {
                                status: body.status,
                                access_token: ''
                            }, function (blockErr, user) {
                                if (user) {
                                    nextCall(null, body)
                                } else {
                                    nextCall('USHBNU-400', null);
                                }
                            })
                        } else if (err && err.length) {
                            nextCall(err[0].msg + "-400", null);
                        } else {
                            nextCall('UNF-400', null)
                        }
                    });
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }
                return res.sendToEncode({
                    status: 200,
                    message: 'USHBUS',
                    data: response
                })
            })
    },

    confirmUser: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('user_id', 'UIIR').notEmpty('');
                    req.checkBody('admin_id', 'MP').notEmpty('');
                    req.checkBody('email', 'EIAE').notEmpty('');                                        
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    UserSchema.findOne({
                        _id: body.user_id
                    }).select({
                        '_id': 1,
                        'first_name': 1,
                        'last_name': 1,
                        'email' :1,
                    }).exec(function (err, userData) {
                        if (userData) {
                            UserSchema.update({
                                _id: body.user_id
                            }, {
                                confirmation: true                                
                            }, function (blockErr, user) {
                                if (user) {
                                    async.parallel([
                                        function(notificationCallback) {
                                            notificationObj = {
                                                'title': 'Your registration has been confirmed',
                                                'artist_id': body.user_id,
                                                'folder_id':'',
                                                'folder_name':'',
                                                'type': 1,
                                                'art_status':'',
                                                'created_by':body.admin_id,
                                                'status':true
                                            };
                                            var notification = new NotificationSchema(notificationObj);
                                            notification.save(function (notiErr, notRes){
                                                console.log("notification", notRes);
                                                console.log("notiErr", notiErr);
                                                notificationCallback(null, true);
                                            });
                                        },
                                        function(confirmCallback) {
                                            ejs.renderFile(__dirname +'/../../../views/templates/artist-approved.html', {
                                                config: config,                                        
                                                type: 'Approved'									
                                            }, {}, function(err, html) {
                                                if (err) {
                                                    console.log("in ej error",err)
                                                }                                                
                                                Mailer.customMail({
                                                    to: userData.email,
                                                    // bcc: admin.email,
                                                    from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                                    subject: 'Registration Confirmed',
                                                    html: html
            
                                                }, function (err, info) {
                                                    console.log("err Registration ",err);
                                                    console.log("info Registration",info);
                                                    confirmCallback(null, true);
                                                });
                                            });
                                        },
                                        function(dashboardCallback) {
                                            /*Email for dashboard walkthrough */
                                            ejs.renderFile(__dirname +'/../../../views/templates/dashboard.html', {
                                                config: config,
                                                userName: userData.first_name+' '+userData.last_name,
                                                email: userData.email,
                                                faqUrl: config.faqUrl                                        

                                            }, {}, function(err, html) {
                                                if (err) {
                                                    console.log("in ej error",err)
                                                }
                                                console.log("html",html);
                                                Mailer.customMail({
                                                    to: userData.email,
                                                    // bcc: admin.email,
                                                    from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                                    subject: 'Dashboard walkthrough',
                                                    html: html
            
                                                }, function (err, info) {
                                                    if (err) {                                
                                                        dashboardCallback(true, null);
                                                    } else {                                
                                                        dashboardCallback(null, true);
                                                       
                                                    }
                                                });
                                            });
                                        }
                                    ],
                                    function(finalErr, finalRes){
                                        if(finalErr){
                                            console.log("in err");
                                            return nextCall('MSE' + '-400', null);
                                        } else {
                                            nextCall(null, body);
                                        }
                                    });
                                    

                                     // var html = '<tbody>';
                                    // html += '<tr>';
                                    // html += '<td style="padding: 50px 10px 10px;font-size: 18px;"> Hello ' + userData.first_name +' ' +userData.last_name + ',</td>';
                                    // html += '</tr>';
                                    // html += '<tr>';
                                    // html += '<td style="padding: 5px 50px;font-size: 16px;">'+MSG['ACM'] +'</td></tr>';
                                    // html += '<tr><td style="padding: 5px 50px;font-size: 16px;">Login URL: <a href="'+ config.loginUrl+'">'+ config.loginUrl + '</a></td></tr>';
                                    // html += '<tr><td style="padding: 10px 50px 40px;font-size: 16px;">Your Email: '+ userData.email+'</td></tr>';
                                    // html += '<tr><td></td></tr>';
                                    // html += '</tbody>';
                                    // Mailer.mail({
                                    //     to: userData.email,
                                    //     // bcc: body.email,
                                    //     from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                    //     subject: 'Registration Confirmed',
                                    //     html: html,
                                    //     language: req.headers.language
                                    // }, function (err, info) {
                                    //     if (err) {
                                    //         console.log("err",err);                                
                                    //         // return nextCall(err[0].MSG + '-400', null);
                                    //     } else {                                
                                    //         var data = {};
                                    //         console.log("in email success");
                                    //         // nextCall(null, body);
                                    //     }
                                    // });

                                    // var html = '<tbody>';
                                    // html += '<tr>';
                                    // html += '<td style="padding: 50px 10px 10px;font-size: 18px;"> Hello ' + userData.first_name +' ' +userData.last_name + ',</td>';
                                    // html += '</tr>';
                                    // html += '<tr>';
                                    // html += '<td style="padding: 5px 50px;font-size: 16px;"> Dashboard walkthrough for artist portal.</td></tr>';
                                    // html += '<tr><td style="padding: 5px 50px;40px; font-size: 16px;">Check FAQ Url: <a href="'+ config.faqUrl+'">'+ config.faqUrl + '</a></td></tr>';                                    
                                    // html += '<tr><td></td></tr>';
                                    // html += '</tbody>';
                                    // Mailer.mail({
                                    //     to: userData.email,
                                    //     // bcc: body.email,
                                    //     from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                    //     subject: 'Dashboard walkthrough',
                                    //     html: html,
                                    //     language: req.headers.language
                                    // }, function (err, info) {
                                    //     if (err) {                                
                                    //         return nextCall(err[0].MSG + '-400', null);
                                    //     } else {                                
                                    //         var data = {};
                                    //         nextCall(null, body);
                                    //     }
                                    // });
                                    
                                } else {
                                    nextCall('URHNBCS-400', null);
                                }
                            })
                        } else if (err && err.length) {
                            nextCall(err[0].msg + "-400", null);
                        } else {
                            nextCall('UNF-400', null)
                        }
                    });
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: arr[0] || 'SWW',
                        data: {}
                    })
                }
                return res.sendToEncode({
                    status: 200,
                    message: 'URHBCS',
                    data: response
                })
            })
    },

    declineUserRequest: function(req, res){
        async.waterfall([
            function (nextCall) {
                req.checkBody('user_id', 'UIIR').notEmpty('');
                req.checkBody('admin_id', 'MP').notEmpty('');
                req.checkBody('email', 'EIAE').notEmpty('');                                        
                var err = req.validationErrors();
                if (err && err.length) {
                    nextCall(err[0].msg + "-400", null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {
                UserSchema.findOne({
                    _id: body.user_id
                }).select({
                    '_id': 1,
                    'first_name': 1,
                    'last_name': 1,
                    'email' :1,
                }).exec(function (err, userData) {
                    if (userData) {
                        UserSchema.remove({
                            _id: body.user_id
                        },function (deleteErr, user) {
                            console.log("user",user);
                            console.log("deleteErr",deleteErr);
                            if (user) { 
                                
                                ejs.renderFile(__dirname +'/../../../views/templates/artist-approved.html', {
                                    config: config,
                                    type: 'Declined'									
                                }, {}, function(err, html) {
                                    if (err) {
                                        console.log("in ej error",err)
                                    }
                                    console.log("html",html);
                                    Mailer.customMail({
                                        to: userData.email,
                                        // bcc: admin.email,
                                        from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                        subject: 'Registration declined',
                                        html: html

                                    }, function (err, info) {
                                        if (err) {                                
                                            return nextCall(err[0].MSG + '-400', null);
                                        } else {                                
                                            var data = {};
                                            nextCall(null, body);
                                        }
                                    });
                                });

                                // var html = '<tbody>';
                                // html += '<tr>';
                                // html += '<td style="padding: 50px 10px 10px;font-size: 18px;"> Hello ' + userData.first_name +' ' +userData.last_name + ',</td>';
                                // html += '</tr>';
                                // html += '<tr>';
                                // html += '<td style="padding: 5px 50px 40px;font-size: 16px;">'+MSG['ADM'] +'</td></tr>';
                                // html += '<tr><td></td></tr>';
                                // html += '</tbody>';
                                // Mailer.mail({
                                //     to: userData.email,
                                //     // bcc: body.email,
                                //     from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                //     subject: 'Registration declined',
                                //     html: html,
                                //     language: req.headers.language
                                // }, function (err, info) {
                                //     if (err) {                                
                                //         return nextCall(err[0].MSG + '-400', null);
                                //     } else {                                
                                //         var data = {};
                                //         nextCall(null, body);
                                //     }
                                // });
                                // nextCall(null, body)
                            } else {
                                nextCall('URHNBDS-400', null);
                            }
                        })
                    } else if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall('UNF-400', null)
                    }
                });
            }
        ],
        function (err, response) {
            if (err) {
                var arr = err.split('-');
                return res.sendToEncode({
                    status: arr[1],
                    message: arr[0] || 'SWW',
                    data: {}
                })
            }
            return res.sendToEncode({
                status: 200,
                message: 'URHBDS',
                data: response
            })
        })
    },

    sendEmail : function(req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('type', 'MP').notEmpty('');
                req.checkBody('message', 'MP').notEmpty('');                    
                req.checkBody('subject', 'MP').notEmpty('');                                        
                var err = req.validationErrors();
                if (err && err.length) {
                    nextCall(err[0].msg + "-400", null);
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {              
                var userEmails = [];
                if(body.type == 'filter'){
                    let query1 = {};                                       

                    if (req.body.filter && _.keys(req.body.filter).length > 0) {
                        _.map(req.body.filter, function (val, key) {
                            if (key === 'date') {
                                var startDate = moment(val.startDate, "YYYY-MM-DD").startOf('day').toISOString();
                                var endDate = moment(val.endDate, "YYYY-MM-DD").endOf('day').toISOString();
                                query1['created_at'] = {
                                    $gte: startDate,
                                    $lt: endDate
                                }
                            } else {                               
                                query1[key] = {
                                    $regex: val,
                                    $options: 'i'
                                }                               
                            }
                        });
                    }
                    
                    UserSchema.find(query1).select({ '_id':1, 'email':1 }).exec( function(error, users) {                       
                       if(users.length <= 0){
                            nextCall('UNF-400', null);                            
                        } else {
                            const sights = _.map(users, function square(item) {
                                userEmails.push(item.email);
                            });
                            nextCall( null, userEmails);
                        }
                    });
                } else if(body.type == 'selected'){
    
                    if(!body.id || body.id.length === 0 ) {          
                        return nextCall('MP-400', null); 
                    }    
                    
                    UserSchema.find({ _id: { $in: body.id } }, { '_id':1, 'email':1 },                       
                    function(error, users) {                        
                        if(users.length <= 0){
                            nextCall('UNF-400', null);  
                        } else {
                            const sights = _.map(users, function square(item) {
                                userEmails.push(item.email);
                            });
                            nextCall( null, userEmails);
                        }    
                    });
        
                } else { 
                    UserSchema.find( {is_deleted : false}, {'_id':1, 'email':1}, function(err, users) {                       
                        if(users.length <= 0){
                            nextCall('UNF-400', null);  
                        } else {
                            const sights = _.map(users, function square(item) {
                                userEmails.push(item.email);
                            });
                            console.log("userEmails", userEmails);
                            nextCall( null, userEmails);
                        }  
                    });                   
                  
                }               
               
            },
            function(body, nextCall){
                console.log("userEmailsbody", body);
                if(body.length > 0){
                    nextCall(null, body);
                } else {
                    nextCall(true, null);
                }  
            },          
        ],        
        function (err, response) {
            if (err) {
                var arr = err.split('-');
                return res.sendToEncode({
                    status: arr[1],
                    message: arr[0] || 'SWW',
                    data: {}
                })
            }
            res.sendToEncode({
                status: 200,
                message: 'EHBSS'
            });

            // Send email to all users
            users.prepareEmailSlot(response, req.body.subject, req.body.message);
        })
    },


    prepareEmailSlot: async (userEmails, subject, message) => {
        var page = 0;

        if(!userEmails.length){
            return false;
        }

        while (true) {

            const fragment = await users.getEmailFragment(userEmails, subject, message, page);
            if (fragment.nextPage) {
                page = fragment.nextPage;
            } else {
                break;
            }
        } 
    },

    getEmailFragment:  async (userEmails, subject, message, offset = 0)  => {      

        var limit = offset + 5;

        var BunchOfEmail = userEmails.slice(offset,limit);

        var html = '<tbody>';                                
        html += '<tr>';
        html += '<td style="padding: 5px 50px 60px;font-size: 16px;">'+message+'</td>';
        html += '</tr>';
        html += '</tbody>';

        var emailOptions = {
            html: html,
            from: 'Artist Portal <'+config.mailOptions.auth.user+'>',
            bcc: BunchOfEmail,
            subject: subject
        }   
        await Mailer.mail(emailOptions, function(err, email){

            //console.log("here");
            console.log('Email ---', err, email);
        });

        return {   
            nextPage: limit < userEmails.length ? limit : undefined
        }
    },

    getUser: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('user_id', 'UIIR').notEmpty('');
                    var err = req.validationErrors();
                    if (err && err.length) {
                        nextCall(err[0].msg + "-400", null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    AdminSchema.findOne({
                        _id: body.user_id
                    }).select({
                        'first_name': 1,
                        'last_name': 1,
                        'email': 1,
                        'phone': 1,
                        'profile_picture': 1,
                        '_id': 1,
                        'created_at': 1,
                        'status': 1
                    }).populate('categories.category_id', 'name status').exec(function (err, userData) {
                        if (userData) {
                            nextCall(null, userData);
                        } else if (err && err.length) {
                            nextCall(err[0].msg + "-400", null);
                        } else {
                            nextCall('UNF-400', null)
                        }
                    });
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
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
            })
    }

   
    
}

module.exports = users;