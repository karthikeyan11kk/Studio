const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const adminSchema=new mongoose.Schema({
    Username:String,
    Password:String
  });
  
  adminSchema.plugin(passportLocalMongoose);
  
  
  module.exports =mongoose.model("Admin",adminSchema);
