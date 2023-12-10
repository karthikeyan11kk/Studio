

if(process.env.NOBE_ENV !=="production")
{
  require("dotenv").config();
}

const passportLocal = require('passport-local');
const passport = require('passport');
const express=require("express");
const flash = require('connect-flash');
const mongoose=require("mongoose");
const multer=require("multer");
const session = require('express-session');
const Admin = require("./models/adminmodel");
const MongoStore = require('connect-mongo');

const {storage}=require(__dirname + "/index.js");
const upload=multer({storage});
const dbUrl=process.env.Db_url;
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(dbUrl, { useNewUrlParser: true });



const sessionConfig = {
  secret: 'SecretCode',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    maxAge: 1000 * 60 * 60 * 24,
  },
};
app.use(session(sessionConfig));
app.use(flash());


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

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

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

var namecust;
var emailcust;


app.get('/register', (req, res) => {
  res.render("register");
});

// POST request to handle user registration
app.post('/register', async (req, res) => {
  try {
      const { username, password } = req.body;
      const registerUser = new Admin({ username});
      const user = await Admin.register(registerUser, password);
      req.flash("success", "Successfully Registered!");
      res.redirect("/register");
  } catch (e) {
      req.flash("error", e.message);
      console.log(e.message);
      res.redirect("/register");
  }
});
app.get("/photogallery", async (req, res) => {
  try {
    const data = await Images.find({});
    res.render("photogallery", { pic: data });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});

app.get("/", async (req, res) => {
  try {
    const data = await Images.find({});
    res.render("home", { pic: data });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/thanks", (req, res) => {
  res.render("thanks", { cusname: namecust, cusmail: emailcust });
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", async (req, res) => {
  try {
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
await customer.save();
    res.redirect("/thanks");
}
catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", passport.authenticate("local", {
  failureFlash: true,
  failureRedirect: "/login"
}), (req, res) => {
  res.redirect("/adminadd");
});

app.get("/adminadd", isLoggedIn, (req, res) => {
  res.render("Add");
});

app.post("/adminadd", upload.single("pic"), async (req, res) => {
  try {
    const images=new Images({
          fields:req.body.addfield,
          original:req.file.originalname,
          url:req.file.path,
          filename:req.file.filename
      });
       await images.save();
       console.log("Sucess");
       res.redirect("adminadd");
      }
  catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});
app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
      if (err) {
          return next(err);
      }
      res.redirect("/login");
  });
});

app.get("/admindelete", isLoggedIn, async (req, res) => {
  try {
    const data = await Images.find({});
    res.render("Delete", { pic: data });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});

app.post("/admindelete", async (req, res) => {
  try {
    const id=req.body.checkbox;
        await Images.findByIdAndRemove(id).then(function(data,err){
          console.log("Sucess");
          res.redirect("admindelete");
        })
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});

app.get("/adminbooked", isLoggedIn, async(req, res) => {
  try {
    const data = await Contact.find({});
    res.render("Booked", { book: data });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { err });
  }
});


app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) {
    err.message = 'Something went wrong';
  }
  res.status(status).render('error', { err });
});
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
 });
app.all('*', (req, res, next) => {
  res.status(404).render('error', { message: 'Page not found', status: 404 });
});

const PORT = process.env.PORT || 1111;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
