import  express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwttkon from "jsonwebtoken"
const salt=bcrypt.genSalt(10)
mongoose.connect("mongodb+srv://joyboy:UFu4gJSMu9GRbHlK@cluster0.kcd7v0f.mongodb.net/").then(()=>{
    console.log("connected to db")
}).catch(()=>{
    console.log("not connected to db")
})
const bookdata=new mongoose.Schema({
    title:String,
    author:String,
    descp:String
})
const userdata=new mongoose.Schema({
    username:String,
    email:String,
    password:String
})

const User=mongoose.model("user",userdata);
const Book=mongoose.model("book",bookdata);
const app=express();
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));

let errors=true
app.post("/register",async(req,res)=>{
    try {
        const salt=await bcrypt.genSalt(10)
        const secpass=await bcrypt.hash(req.body.password,salt)
       const newuser=User({
        username:req.body.username,
        email:req.body.email,
        password:secpass
       })
       newuser.save(); 
       errors=false;   
       res.json({errors}) 
    } catch (error) {
        console.log("error in registration ",error)
        res.json({errors})
    }
   
})
app.post("/login",async(req,res)=>{
    
    let success=false;
    let user=req.body.username;
    let password=req.body.password;
    User.findOne({email:user}).then(async (found)=>{
       if(!found){
        
        res.json({success})
       }else{
        let comparepass= await bcrypt.compare(password,found.password)

        if(!comparepass){
            
            
            success=false;
            res.json({success})

            
            
        }else{
            let secret="kyaboltepublic"
            let data={
                user:found._id
            }
            const jwtdata=jwttkon.sign(data,secret);
            
            success=true;
            res.json({success,jwtdata})
        }
       }
    })
    
})

app.post("/addnotes",(req,res)=>{
   
   const newbook=Book({
    title:req.body.title,
    author:req.body.author,
    descp:req.body.descp
   })
   newbook.save();

   Book.find({}).then(found=>{
            if(!found){
                console.log("insert  a book")
            }else{
                
                res.json(found);
            }
           })
   
})
app.get("/addnotes",(req,res)=>{
    let succue="hello";
    Book.find({}).then(found=>{
        if(!found){
            console.log("insert  a book")
        }else{
            
            res.json(found);
        }
       })
})

app.put("/update",(req,res)=>{
    let ID=req.body.id;
    console.log(req.body)
    Book.findByIdAndUpdate(ID,{title:req.body.title,author:req.body.author,descp:req.body.descp}).then(found=>{
        if(!found){
            console.log("not updated")
        }else{
            console.log(found)
            console.log("updated")
        }
    })

   
})
app.delete("/delete",(req,res)=>{
    let ID=req.body.id;
    Book.findByIdAndDelete(ID).then(found=>{
        if(!found){
            console.log("not deleted")
        }else{
            console.log("delete");
        }
    })
})


app.listen(5000,()=>{
    console.log("listening at 5000")
})