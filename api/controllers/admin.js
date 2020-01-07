var debug = require('debug')('x-code:v1:controllers:Admin'),
    moment = require('moment'),
    jwt = require('jsonwebtoken'),
    async = require('async'),
        path = require('path'),
        shortid = require('shortid'),
        _ = require('underscore'),
        phoneCustom = require('libphonenumber-js/custom'),

        custom = require('libphonenumber-js/custom'),
        metadata = require('libphonenumber-js/metadata.min.json'),
        random = require("random-js")(),

        MSG = require('../../message_admin.js'),
        XLSX = rootRequire('support/exports/xls/index.js'),
        config = rootRequire('./config/global.js'),

        ED = rootRequire('services/encry_decry'),
        Uploader = rootRequire('support/uploader'),
        Mailer = rootRequire('support/mailer'),
        DS = rootRequire('services/date'); // date services

var mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;

var randomstring = require("randomstring");
const ejs = require('ejs');

const AdminSchema = rootRequire('db/mongodb/Admin');
const UserSchema = rootRequire('db/mongodb/Users');


var users = {

    login: function (req, res) {
        async.waterfall([
                function (nextCall) { // check required parameters
                    req.checkBody('email', 'EIR').notEmpty();
                    req.checkBody('password', 'PIR').notEmpty();

                    var error = req.validationErrors();

                    if (error && error.length) {
                        nextCall(error[0].msg + '-400', null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    var passwordEncrypt = ED.encrypt(body.password);
                    if (body.type === 'admin') {
                        AdminSchema.findOne({
                            email: body.email,
                            password: passwordEncrypt
                        }, {
                            id: 1,
                            email: 1,
                            first_name: 1,
                            last_name: 1,
                            profile_picture: 1,
                            created_at: 1,
                        }, function (err, user) {
                            if (err) {
                                nextCall('SWW-400', null);
                            }

                            if (!user) {
                                return nextCall('PEVEOP-400', null);
                            }
                            var currentTimestamp = moment().format('x');
                            var jwtData = {
                                id: user._id,
                                email: body.email,
                                type: 'admin'
                            };

                            jwtData.currentTimestamp = currentTimestamp;
                            new_access_token = jwt.sign(jwtData, config.secret, {
                                expiresIn: config.expiresInTime
                            });

                            AdminSchema.update({
                                "_id": user._id
                            }, {
                                "access_token": new_access_token
                            }, function (err, result) {});
                            var response = {
                                "id": user.id,
                                "email": user.email,
                                "first_name": user.first_name,
                                "last_name": user.last_name,
                                "profile_picture" : user.profile_picture,
                                "access_token": new_access_token,
                                "created_at": user.created_at,

                            }
                            nextCall(null, response);
                        });
                    } else {
                        UserSchema.findOne({
                            email: body.email,
                            password: passwordEncrypt,
                        }, {
                            id: 1,
                            email: 1,
                            first_name: 1,
                            last_name: 1,
                            profile_picture: 1,
                            phone: 1,
                            portfolio_link: 1,
                            sec_portfolio_link: 1,
                            design_link: 1,
                            exp_year: 1,
                            insta_handle: 1,
                            influent_artist: 1,
                            art_style : 1,
                            ship_address : 1,
                            display_art : 1,
                            us_citizen : 1,
                            tshirt_size : 1,
                            access_token: 1,                            
                            created_at: 1,
                            support_id: 1,
                            is_deleted: 1,
                            confirmation:1,
                            status:1

                        }, function (err, user) {
                            if (err) {
                                nextCall('SWW-400', null);
                            }

                            if (!user) {
                                return nextCall('PEVEOP-400', null);
                            }
                            // console.log("is_delted", user.is_deleted);
                            if(user.is_deleted){
                                return nextCall('YAHBD', null)
                            }
                            console.log("user status",user.status);
                            if(!user.status){
                                return nextCall('YAD', null)
                            }
                            if(!user.confirmation){
                                return nextCall('YCHP',null)
                            }
                            var currentTimestamp = moment().format('x');
                            var jwtData = {
                                id: user._id,
                                email: body.email,
                                type: 'artist'
                            };

                            jwtData.currentTimestamp = currentTimestamp;
                            new_access_token = jwt.sign(jwtData, config.secret, {
                                expiresIn: config.expiresInTime
                            });

                            UserSchema.update({
                                "_id": user._id
                            }, {
                                "access_token": new_access_token
                            }, function (err, result) {
                                
                            });
                            var response = {
                                "id": user.id,
                                "email": user.email,
                                "first_name": user.first_name,
                                "last_name": user.last_name,
                                "phone": user.phone,
                                "profile_picture": user.profile_picture,
                                "portfolio_link": user.portfolio_link,
                                "sec_portfolio_link": user.sec_portfolio_link,
                                "design_link": user.design_link,
                                "exp_year": user.exp_year,  
                                "insta_handle": user.insta_handle,
                                "influent_artist": user.influent_artist,
                                "art_style" : user.art_style,
                                "ship_address" : user.ship_address,
                                "display_art" : user.display_art,
                                "us_citizen" : user.us_citizen,
                                "tshirt_size" : user.tshirt_size,
                                "access_token": new_access_token,
                                "created_at": user.created_at,
                                "support_id":user.support_id

                            }
                            nextCall(null, response);
                        });
                    }

                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: (arr[0]) || 'SWW',
                        data: {}
                    });
                }                
                return res.sendToEncode({
                    status: 200,
                    message: 'LS',
                    data: response
                });
            });
    },

    forgotPassword: function (req, res) {
        async.waterfall([
                function (nextCall) { // check required parameters
                    req.checkBody('email', 'EIR').notEmpty();
                                   var error = req.validationErrors();
                    if (error && error.length) {
                        nextCall(error[0].MSG + '-100', null);
                    }
                    nextCall(null, req.body);
                },
                function (body, nextCall) {
                    var selectSchema = UserSchema;
                    var url_link = '/reset_password/';
                    if (body.type === 'admin') {
                        selectSchema = AdminSchema;
                        var url_link = '/admin_reset_password/';
                    }
                    selectSchema.findOne({
                        email: body.email,
                    }, function (err, user) {
                        if (!user) {
                            return nextCall('ENF-400', null);
                        };                        

                        // return false;
                        var resetPasswordToken = randomstring.generate(10) + moment().format('x');
                        selectSchema.updateOne({
                            "_id": user._id
                        }, {
                            $set: {
                                reset_token: resetPasswordToken
                            }
                        }, function (err, result) {
                            // send email
                            // var link = config.appHost + url_link + resetPasswordToken;
                            // var html = '<tbody>';
                            // html += '<tr>';
                            // html += '<td style="padding: 50px 10px 10px;font-size: 18px;">' + MSG['RPM'] + '</td>';
                            // html += '</tr>';
                            // html += '<tr>';
                            // html += '<td style="padding: 10px 50px 40;font-size: 16px;"><a href =' + link + '>' + MSG['RP'] + '</a></td>';
                            // html += '<tr><td></td></tr>';
                            // html += '</tbody>';
                            // Mailer.mail({
                            //     to: body.email,
                            //     from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                            //     subject: 'Reset your password for sign in to Artist Portal',
                            //     html: html,
                            //     language: req.headers.language
                            // }, function (err, info) {
                            //     if (err) {
                            //         console.log("mail send error:", err);
                            //         return nextCall(err[0].MSG + '-400', null);
                            //     } else {
                            //         var data = {};
                            //         return nextCall(null, true);
                            //     }
                            // });
                            
                            var link = config.appHost + url_link + resetPasswordToken;
                           
                            ejs.renderFile(__dirname +'/../../../views/templates/reset-password.html', {
                                config: config,
                                resetLink: link, 
                                userName: user.first_name+' '+user.last_name                                

                            }, {}, function(err, html) {
                                if (err) {
                                    console.log("in ej error",err)
                                }
                                // console.log("html",html);
                                Mailer.customMail({
                                    to: body.email,
                                    // bcc: admin.email,
                                    from: 'Artist Portal <' + config.mailOptions.auth.user + '>',
                                    subject: 'Reset your password for sign in to Artist Portal',
                                    html: html

                                }, function (err, info) {
                                    console.log("err", err);
                                    console.log("info", info);
                                    if (err) { 
                                        console.log("mail send error:", err);                               
                                        return nextCall(err[0].MSG + '-400', null);
                                    } else {                                
                                        var data = {};
                                        return nextCall(null, true);
                                    }
                                });
                            });

                        });
                    });

                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: (arr[0]) || 'SWW',
                        data: {}
                    });
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'ESS',
                    data: {}
                });
            });
    },

    changePassword: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('id', 'UIR').notEmpty();
                    req.checkBody('new_password', 'PIR').notEmpty();
                    req.checkBody('old_password', 'PIR').notEmpty();
                    var selectSchema = UserSchema;
                    if(req.body.user_type === 'admin'){
                        selectSchema = AdminSchema;
                    }
                    var error = req.validationErrors();
                    if (error && error.length) {
                        return nextCall(error[0].msg + '-400', null);
                    }
                    nextCall(null, req.body, selectSchema);
                   
                },
                function (body, selectSchema, nextCall) {                    
                    
                    selectSchema.findOne({
                        _id: body.id
                    }, function (err, user) {
                        if (!user) {
                            nextCall('UNF-400', null);
                        };

                        var old_password = ED.encrypt(body.old_password);
                        
                        if (user.password == old_password) {
                            nextCall(null, body, selectSchema);
                        } else {
                            nextCall('OPDNM-400', null);
                        }
                    });
                },
                function (body, selectSchema, nextCall) {
                    var new_password = ED.encrypt(body.new_password);
                    selectSchema.updateOne({
                        "_id": body.id
                    }, {
                        $set: {
                            password: new_password
                        }
                    }, function (err, result) {
                        nextCall(null, true);
                    });
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: (arr[0]) || 'SWW',
                        data: {}
                    });
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'YPHCS',
                    data: {}
                });
            });
    },

    checkResetToken: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    req.checkBody('token', 'TIR').notEmpty();
                    var error = req.validationErrors();

                    if (error && error.length) {
                        return nextCall(error[0].msg + '-400', null);
                    } else {
                        nextCall(null, req.body);
                    }
                },
                function (body, nextCall) {
                    var selectSchema = UserSchema;
                    if (body.type === 'admin') {
                        selectSchema = AdminSchema;
                    }
                    selectSchema.findOne({
                        reset_token: body.token
                    }, {
                        _id: 1
                    }, function (err, user) {
                        if (user) {
                            nextCall(null, true);
                        } else {
                            return nextCall('LE-400', null);
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
                    message: 'VT',
                    data: {}
                })
            })
    },

    resetPassword: function (req, res) {
        async.waterfall([
            function (nextCall) {
                req.checkBody('password', 'PIR').notEmpty();
                req.checkBody('token', 'TIR').notEmpty();

                var error = req.validationErrors();
                if (error && error.length) {
                    nextCall(error[0].msg + '-400', null)
                } else {
                    nextCall(null, req.body);
                }
            },
            function (body, nextCall) {
                var selectSchema = UserSchema;
                if (body.type === 'admin') {
                    selectSchema = AdminSchema;
                }
                selectSchema.findOne({
                    reset_token: body.token
                }, function (err, user) {
                    if (user) {
                        var new_password = ED.encrypt(body.password);
                        selectSchema.update({
                            reset_token: body.token
                        }, {
                            $set: {
                                password: new_password,
                                reset_token: ''
                            }
                        }, function () {
                            return nextCall(null, true);
                        });
                    } else {
                        return nextCall('LE-400', null);
                    }
                });
            }

        ], function (err, response) {
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
                message: 'PRS',
                data: {}
            })

        });
    },

    updateProfile: function (req, res) {
        async.waterfall([
                function (nextCall) {                    
                    Uploader.getFormFields(req, nextCall);
                },
                function (fields, files, nextCall) {
                    if (!fields.id) {
                        nextCall('UIR-400', null);
                    } else {
                        nextCall(null, fields, files);
                    }
                },
                function (fields, files, nextCall) {                    
                    var selectSchema = UserSchema;                    
                    if (req.body.user_type === 'admin') {
                        selectSchema = AdminSchema;                       
                    }
                    selectSchema.findOne({
                        _id: fields.id
                    }, function (err, user) {
                        if (user != null) {
                            fields.user = user;
                            nextCall(null, fields, files, selectSchema);
                        } else {
                            nextCall('UNF-400', null);
                        }
                    });
                },
                function (fields, files, selectSchema, nextCall) {
                    if (files && files['profile_picture']) {
                        fields.oldImageUrl = fields.user.profile_picture;

                        imageFile = files['profile_picture'].path;

                        var ext = path.extname(files['profile_picture'].name);
                        var imageFile = `uploads/profile_pictures/${DS.getTime()}${ext}`;
                        Uploader.upload({
                                src: files['profile_picture'].path,
                                dst: rootPath + "/" + imageFile
                            },
                            function () {
                                fields.profile_picture = imageFile;
                                nextCall(null, fields, selectSchema)
                            }
                        );
                    } else {
                        nextCall(null, fields, selectSchema)
                    }
                },                
                function(body, selectSchema, nextCall){
                    delete body.email;
                    selectSchema.update({
                        _id: body.id
                    }, {
                        $set: body
                    }, function (err, updatedUser) {
                        if (err) {
                            return nextCall('UHBNU-400', null);
                        }
                        if (body.oldImageUrl) {
                            Uploader.remove({
                                    filepath: rootPath + "/" + body.oldImageUrl
                                },
                                function (err, result) {}
                            );
                        }
                        selectSchema.findOne({
                            _id: body.id
                        }, {
                            password:0,
                            __v:0,
                            access_token:0,
                            reset_token:0,
                            status:0,
                            updated_at:0
                            
                        },function (err, userData) {
                            nextCall(null, userData);
                        });
                    });
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: (arr[0]) || 'SWW',
                        data: {}
                    });
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'UPHBUS',
                    data: response
                });
            });
    },

    logout: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    var reqToken = req.headers['access_token'];                    
                    var selectSchema = UserSchema;
                    if(req.body.user_type === 'admin'){
                        selectSchema = AdminSchema;
                    }
                    selectSchema.findOne({
                        access_token: reqToken
                    }, {
                        _id: 1
                    }, function (err, user) {
                        if (user) {
                            selectSchema.update({
                                _id: user.id
                            }, {
                                $set: {
                                    access_token: ''
                                }
                            }, function () {
                                nextCall(null, true);
                            });
                        } else if (err && error.err) {
                            nextCall(err[0].msg + '-400', null);
                        } else {
                            return res.sendToEncode({
                                status: 417,
                                message: 'SWW',
                                data: {}
                            });
                        }
                    })
                }
            ],
            function (err, response) {
                if (err) {
                    var arr = err.split('-');
                    return res.sendToEncode({
                        status: arr[1],
                        message: (arr[0]) || 'SWW',
                        data: {}
                    });
                }

                return res.sendToEncode({
                    status: 200,
                    message: 'LOGOUT',
                    data: response
                });
            });
    },

    /* Use for add data direct into table */
    addAdmin: function (req, res) {
        var abc = new AdminSchema({
            first_name: req.body.first_name, //'admin',
            last_name: req.body.last_name,
            email: req.body.email, //'nutan.lakhani@agileinfoways.com',
            password: ED.encrypt(req.body.password),
            access_token: '',
            reset_token: ''
        });

        abc.save();
    },
    /* Use for add data direct into table */
    addArtist: function (req, res) {
        var abc = new UserSchema({
            first_name: 'artist',
            last_name: 'user',
            email: 'dipten.bhut@agileinfoways.com',
            phone:'123456789',
            password: ED.encrypt('123456'),
            confirmation: true,
            access_token: '',
            reset_token: '',            
            
        });

        abc.save();
    }
};

module.exports = users;