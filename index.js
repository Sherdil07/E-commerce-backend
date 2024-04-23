const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const { error } = require("console");
const { type } = require("os");

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB;
mongoose.connect(
  "mongodb+srv://sherdildev:dev@cluster0.3x4esy8.mongodb.net/e-commerce"
);

// API Creation

app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// app.listen(port,(error)=>{
//     if(!error){
//         console.log("Server is Running on port:"+port)
//     }else{
//         console.log("Error:"+error)
//     }
// })

// image storage engine
const storage = multer.diskStorage({
  destination: "./uploads/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// creating upload function using multer
const upload = multer({ storage: storage });

// creating upload endpoints for images
app.use("/images", express.static("uploads/images"));

app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});
// creating schema for creating products using mongoDB
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});
// endpoint with add product
app.post("/addproduct", async (req, res) => {
  // if we have two products or more we will have that in this products
  let products = await Product.find({});
  // automatically generating id
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }
  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  // saving this product in database
  await product.save();
  console.log("Saved");
  // response for the frontend
  // response generated in json format
  res.json({
    success: true,
    name: req.body.name,
  });
});

// Creating api for deleting product
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({
    success:true,
    name:req.body.name
  })
});
// Creating Api for getting all products 
app.get('/allproducts', async(req,res)=>{
   let products= await Product.find({})
   console.log("All Products Fetched")
   res.send(
    products
   )
})
// schema for creating  users model
const Users=mongoose.model('Users',{
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,

  }
})
// Creating endpoint for registring the users 
app.post('/signup',async (req,res)=>{
  // now we will check whether the eamil or user already exist or not 
  let check= await Users.findOne({email:req.body.email})
  if(check){
    return res.status(400).json({success:false,error:"email or user already exist"})
  }
  // empty object where we will get keys from one to 300
  let cart={}
  for(i=0;i<300;i++){
    cart[i]=0;
  }
  // now creating users using user model 
  const user= new Users({
    name:req.body.username,
    email:req.body.email,
    password:req.body.password,
    cartData:cart,
  })
  await user.save()
  const data={
    user:{
      id:user.id

    }
  }
  const token=jwt.sign(data,'secret_ecom')
  res.json({success:true,token})
})
// creating endpoint for user login 
app.post('/login',async (req,res)=>{
  let user= await Users.findOne({email:req.body.email})
  if (user){
    // compare password of that user 
    const passCompare=req.body.password===user.password
    if(passCompare){
      const data={
        user:{
          id:user.id
        }
      }
      const token=jwt.sign(data,'secret_ecom')
      res.json({success:true,token})
    }else{
      res.json({success:false,errors:"Wrong Password"})
    }
  }
  else{
    res.json({success:false,errors:"Wrong Email ID"})
  }
})

// condition using ternary operators.
app.listen(port, (error) => {
  error
    ? console.log("error" + error)
    : console.log("Server is running on port" + port);
});
