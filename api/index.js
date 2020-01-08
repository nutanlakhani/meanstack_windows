var debug = require('debug')('x-code:uploader'),
    config = rootRequire('config/global'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    formidable = require('formidable'),
    gm = require('gm').subClass({ imageMagick: true }),
    mkdirp = require('mkdirp'),
    AESCrypt = rootRequire('services/aes');

var _self = {

    getFormFields: function getFormFields(req, callback) {
        var form = new formidable.IncomingForm();

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(rootPath, '/uploads/tmp');

        // create a directory
        fse.mkdirs(form.uploadDir, function(err) {

            if (err) {
                 //console.log('err---------------',err);
                return callback(err, null, null);
            }
            // log any errors that occur

            form.on('error', function(err){                
                debug('An error has occured: \n' + err);
            });

            // once all the files have been uploaded, send a response to the client
            form.on('end', function() {
                // debug('FORM END!');
            });
            // parse the incoming request containing the form data
            form.parse(req, function(err, fields, files){

               

                // skip to decode code for web request for development
                if (req.sourceOfRequest == 'web') {
                    return callback(err, fields, files);
                }

                //console.log(" cry ", config.cryptoEnable);
                // skip to decode code
                if (!config.cryptoEnable) {
                    return callback(err, fields, files);
                }

                // check data is encoded or not
                if (!fields || (fields && fields.encoded)) {
                    // return callback(true);
                    try {
                        var dec = AESCrypt.decrypt(fields.encoded);
                        fields = JSON.parse(dec);
                        callback(err, fields, files);
                    } catch (err) {
                        return callback(true);
                    }
                }
                
            });
        });
    },

    upload: function (options, callback){
        fse.mkdirs(path.dirname(options.dst), function(err) {
            if (err) {
                return callback(err);
            }
            fse.move(options.src, options.dst, callback);            

        });
    },

    remove: function (options, callback) {
         fse.remove(options.filepath, callback);    
    }

};

module.exports = _self;
