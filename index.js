const port=4000;
const express =require("express")
const app=express();
const mongoose=require("mongoose");
const multer=require("multer")
const jwt=require("jsonwebtoken");
const path=require("path");
const cors=require("cors");
const { error } = require("console");

app.use(express.json());
app.use(cors());

// Database Connection with MongoDB;
mongoose.connect("mongodb+srv://sherdildev:dev@cluster0.3x4esy8.mongodb.net/e-commerce");

// API Creation 


app.get("/",(req,res)=>{
    res.send("Express App is Running")
})


// app.listen(port,(error)=>{
//     if(!error){
//         console.log("Server is Running on port:"+port)
//     }else{
//         console.log("Error:"+error)
//     }
// })



// image storage engine
const storage = multer.diskStorage({
    destination: './uploads/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

// creating upload function using multer
const upload = multer({ storage: storage });

// creating upload endpoints for images
app.use("/images", express.static('uploads/images'));

app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: 0, message: "No file uploaded" });
    }
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});
// creating schema for creating products using mongoDB 
const Product=mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    }
   ,name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true


    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true
    },
})
// endpoint with add product 
app.post('/addproduct', async (req,res)=>{
    const product=new Product({
        id:req.body.id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,

    })
    console.log(product);
    // svaing this product in database
    await product.save();
    console.log("Saved")
    // response for the frontend 
    // response generated in json format
    res.json({
        success:true,
        name:req.body.name,
    })
})

// condition using ternary operators.
app.listen(port,(error)=>{
    error?console.log("error"+error)
    :console.log("Server is running on port"+port)
})


