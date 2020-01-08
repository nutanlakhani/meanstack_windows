var UserSchema = require('../../db/models/user');
var async = require('async');
let bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs-extra')
var crypto = require('crypto');


var users = {
    register:(req, res)=> {
        async.waterfall([
            (nextCall)=> {
                // console.log("body", req);
                if(req.file && req.file.filename){
                    req.body.profile = req.file.filename;
                }
                nextCall(null,req.body)
            },
            (body, nextCall) =>{
                // console.log("body", body)
                UserSchema.findOne({email:body.email}).exec((err, User)=>{
                    if(User){
                        return nextCall({message:"User already exist", status:400})
                    } else{
                        nextCall(null, body)
                    }
                })
            },
            (body, nextCall)=>{                
                const createUSerSchema = new UserSchema(body);
                console.log("in nextCall", createUSerSchema);
                createUSerSchema.save((err, user) => {
                    console.log("in inside",err)
                    if (err) return nextCall(err);
                    delete user.password
                    nextCall(null, user)
                  });
               
            }
        ],(err, resArr)=> {
            if(err){
                return res.status(err.status).json(err);
            } else{
                return res.status(200).json({message:'User registered successfully', data:resArr});
            }
        })
    },

    login:(req, res) =>{
        let email = req.body.email;
        let result = {};
        UserSchema.findOne({email:email}, (err, user) => {
            console.log("user",user);
            if(err){
                res.json({
                    success: false,
                    message: 'User not found'
                })
            } else if(user){
                bcrypt.compare(req.body.password, user.password).then(match => {
                    if (match) {
                      status = 200;
                      // Create a token
                      const payload = { user: user.name };
                      const options = { expiresIn: '2d' };
                      const secret = 'zxcvbnm';
                      const token = jwt.sign(payload, secret, options);
                      console.log("token", token);
                      UserSchema.updateOne({email:user.email}, {token:token}, (err, userData)=>{
                          console.log("err", err);
                          console.log("userData", userData);
                      })
      
                      // console.log('TOKEN', token);
                      result.token = token;
                      result.status = status;
                      result.message = 'Login successfully'
                      delete user.password;
                      user.token = token;
                      result.result = user;
                    } else {
                      status = 401;
                      result.status = status;
                      result.error = `Authentication error`;
                    }
                    res.status(status).send(result);
                });
            } else{
                res.json({
                    success: false,
                    message: 'User not found'
                })
            }
        }); 
    },

    getUser:(req, res) =>{
        let result = {};
        UserSchema.findOne({email:req.body.email}).exec((err, userDetails) =>{ 
            let status = 200;
            if(err){
                result.status = 400;
                result.message = "Oops something went wrong"
            } else if(userDetails){
                delete userDetails.password
                result.status = 200;
                result.data = userDetails
            }
            res.status(status).send(result);
        })
    },

    logout: function (req, res) {
        async.waterfall([
                function (nextCall) {
                    var reqToken = req.headers['authorization'];
                    console.log("reqToken",reqToken);
                    UserSchema.findOne({
                        token: reqToken
                    }, {
                        _id: 1
                    }, function (err, user) {
                        console.log("user", user);
                        console.log("err", err);
                        if (user) {
                            UserSchema.update({
                                _id: user._id
                            }, {
                                $set: {
                                    token: ''
                                }
                            }, function () {
                                nextCall(null, true);
                            });
                        } else if (err && error.err) {
                            nextCall(err[0].msg + '-400', null);
                        } else {
                            return res.send({
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
                    return res.send({
                        status: arr[1],
                        message: (arr[0]) || 'SWW',
                        data: {}
                    });
                }

                return res.send({
                    status: 200,
                    message: 'LOGOUT',
                    data: response
                });
            });
    },

    updateUser: function(req, res){
        async.waterfall([
           
            (nextCall) =>{
                if(req.file && req.file.filename){
                    req.body.profile = req.file.filename;
                }
                // console.log("body", body)
                UserSchema.findOne({_id:req.body._id}).exec((err, User)=>{
                    if(User){
                        if(req.file){
                            req.body.oldImageUrl = User.profile;
                        }
                        nextCall(null, req.body)
                    } else{
                        return nextCall({message:"User not found.", status:400})
                    }
                })
            },
            (body, nextCall)=>{      
                delete body.email;
                let id = body._id;   
                delete body.id;       
                            
                UserSchema.update({
                    _id: id
                }, {
                    $set: body
                }, function (err, updatedUser) {
                    if (err) {
                        return nextCall('UHBNU-400', null);
                    }
                    if (body.oldImageUrl) {
                                               
                        fs.remove(appRoot+"/uploads/" + body.oldImageUrl)
                        .then(() => {
                        console.log('success!')
                        })
                        .catch(err => {
                        console.error(err)
                        })
                    }
                    UserSchema.findOne({
                        _id: id
                    }, {
                        password:0,
                        __v:0,                        
                        status:0,
                        updatedAt:0
                        
                    },function (err, userData) {
                        nextCall(null, userData);
                    });
                });
            }
        ],(err, resArr)=> {
            if(err){
                return res.status(err.status).json(err);
            } else{
                return res.status(200).json({message:'User updated successfully', data:resArr});
            }
        })
    },

    addUser: function (req, res) {
        algorithm = 'aes192',
        password = 'erqAFxxCshjKla';
        var cipher = crypto.createCipher(algorithm, password);
        var crypted = cipher.update('123456', 'utf8', 'hex');
        crypted += cipher.final('hex');
        console.log("crypted", crypted);

      

    
        var abc = new UserSchema({
            firstName: 'test',
            lastName: 'user',
            email: 'test@test.com',
            phone:'123456789',
            password: crypted,
            gender:'male',
            prefix:'miss'
            
        });

        abc.save();

        /*For crypto */
        // var crypto = require('crypto'),
        // algorithm = 'aes192',
        // password = 'erqAFxxCshjKla';

        // var _self = {
        //     encrypt: function encrypt(text) {
        //         var cipher = crypto.createCipher(algorithm, password);
        //         var crypted = cipher.update(text, 'utf8', 'hex');
        //         crypted += cipher.final('hex');
        //         return crypted;
        //     },

        //     decrypt: function decrypt(text) {
        //         var decipher = crypto.createDecipher(algorithm, password);
        //         var dec = decipher.update(text, 'hex', 'utf8');
        //         dec += decipher.final('utf8');
        //         return dec;
        //     }
        // };
    }
}

module.exports = users;
