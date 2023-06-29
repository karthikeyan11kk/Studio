const cloudinary =require("cloudinary").v2;
const {CloudinaryStorage}=require("multer-storage-cloudinary");


cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Cloud_key,
  api_secret: process.env.API_secret,
  secure: true,
});

const storage= new CloudinaryStorage({
  cloudinary,
  params:{
    folder:"Zstudio",
    allowedFormats:["jpeg","png","jpg"]
  }
});

module.exports={
  cloudinary,
  storage
}
