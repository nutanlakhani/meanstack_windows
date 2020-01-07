var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var moment = require('moment');

const CategorySchema = new Schema({
    'cat_name':{
        type:String,
        default:''
    },
    'status':{
        type: Boolean,
        default: true
    },
    'createdAt':{
        type:String,
        default:moment().toISOString()
    },
    'updatedAt':{
        type:String,
        default:moment().toISOString()
    }
})

CategorySchema.pre('save', (next)=>{
    this.createdAt = moment().toISOString();
    this.updatedAt = moment().toISOString();
    next();
})

module.exports = mongoose.model('categories', CategorySchema);