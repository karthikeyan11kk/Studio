if(process.env.NOBE_ENV !=="production")
{
  require("dotenv").config();
}


const express=require("express");
const bodyparser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const multer=require("multer");

const {storage}=require(__dirname + "/index.js");
const upload=multer({storage});


const app=express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended:true}));



mongoose.connect("mongodb://127.0.0.1:27017/Zstudio",{useNewUrlParser:true});


var namecust;
var emailcust;


const adminSchema=new mongoose.Schema({
  User:String,
  Password:String
});
const Admin=mongoose.model("Admin",adminSchema);
const admin=new Admin({
  User:"Zstudio@11",
  Password:"121222"
});
Admin.find().then(data => {
   if(data.length==0)
   {
     Admin.insertMany(admin).then(data=>{
     console.log("Sucess");
     });
   }
 });
const contactSchema=new mongoose.Schema({
  name:String,
  email:String,
  phone:String,
  for:String,
  address:String,
  message:String
});
const Contact=mongoose.model("Contact",contactSchema);

const imageSchema=new mongoose.Schema({
  fields:String,
  original:String,
  url:String,
  filename:String

});
const Images=mongoose.model("Images",imageSchema);


// HOME
app.get("/",function(req,res)
{
  res.render("home");
});
// ABOUT
app.get("/about",function(req,res)
{
  res.render("about");
});
app.get("/thanks",function(req,res)
{
  res.render("thanks",{cusname:namecust,cusmail:emailcust});
});
// CONTACT
app.get("/contact",function(req,res)
{
  res.render("contact");
});
app.post("/contact",function(req,res)
{
const customer=new Contact({
  name:req.body.name,
  email:req.body.email,
  phone:req.body.phoneno,
  for:req.body.book,
  address:req.body.address,
  message:req.body.message
});
namecust=customer.name;
emailcust=customer.email;
const phone=customer.field;
const address=customer.address;
const message=customer.message;
customer.save();
res.redirect("/thanks");
});

// LOGIN
app.get("/login",function(req,res)
{
  res.render("login");
});

app.post("/login",function(req,res)
{
const user=req.body.username;
const pass=req.body.password;
Admin.findOne({User:user}).then(data=>{
  if(data)
  {
    if(data.Password===pass)
    {
      res.render("Add");
      console.log("Sucess");
    }
  }
});
});


// ADD
app.get("/Add",function(req,res)
{
  res.render("Add");
});

app.post("/Add",upload.single("pic"),function(req,res){
const images=new Images({
    fields:req.body.addfield,
    original:req.file.originalname,
    url:req.file.path,
    filename:req.file.filename
});
 images.save();
 console.log("Sucess");
 res.render("Add");
});


// DELETE
app.get("/Delete",function(req,res)
{
    Images.find({}).then(function(data,err){
      if(data){
        console.log(data.field);
      }
      res.render("Delete",{pic:data});
      });
});

app.post("/Delete",function(req,res)
{
const id=req.body.checkbox;
Images.findByIdAndRemove(id).then(function(data,err){
  console.log("Sucess");
  res.redirect("Delete");
});
});

// BOOKED
app.get("/Booked",function(req,res)
{
  res.render("Booked");
});


app.listen(1111,function()
{
  console.log("server is running..");
});
