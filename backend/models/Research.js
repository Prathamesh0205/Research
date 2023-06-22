
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"you must provide name"],
        trim:true
    },
    email:{
        type:String,
        lowercase:true,
        required:[true,"you must provide your email"],
        validate: {
            validator: function(v) {
              return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: props => `${props.value} please enter a valid email address!`
          },
        trim:true
    },
  
    researchpaper:[],
    data:{
        type:Object
    }
})
module.exports = mongoose.model('user',userSchema);