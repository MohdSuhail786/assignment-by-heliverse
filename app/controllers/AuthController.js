const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const formidable = require('formidable')
const XLSX = require('xlsx')
const { validationResult } = require('express-validator')
require('dotenv').config()

exports.login = async (req,res) => {
    try {
        let error = validationResult(req)
        if (!error.isEmpty()) {
            console.log(error.array()[0].msg)
            return res.json({
                error : error.array()[0].msg
            }).status(422)
        }
        let {email,password} = req.body
        let user = await User.findOne({email:email})
        if(!user) {
            return res.json({message:"Invalid login credentials"}).status(422)
        }
        
        let verifyPassword = await bcrypt.compare(password,user.password)
        if(!verifyPassword) {
            return res.json({message:"Invalid login credentials"}).status(422)
        }
        const payload = {
            user: {
                id:user._id,
                name: user.name,
                email: user.email,
                type: user.type
            },
        }
        let accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 30*60 })
        let refreshToken = jwt.sign(payload, process.env.REFRESEH_KEY, { expiresIn: 35*60*60 })
        return res.json({message:"Login successfuly",accessToken: accessToken, refreshToken: refreshToken,user:user}).status(200)   
    } catch (err) {
        console.log(err.message)
    }
}


exports.refreshToken = async (req,res) => {
    try {
        const {refreshToken} = req.body
        if (!refreshToken) {
            return res.json({message: "Unauthorized"}).status(422)
        }
        const jwtData = await jwt.verify(refreshToken,process.env.REFRESEH_KEY)
        if (!jwtData) {
            return res.json({message: "Unauthorized"}).status(401)
        }
        const payload = {user:jwtData.user}

        let accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: 30*60 })
        let RefreshToken = jwt.sign(payload, process.env.REFRESEH_KEY, { expiresIn: 35*60*60 })
        return res.json({message:"session refreshed",accessToken: accessToken, refreshToken: RefreshToken,user:payload.user}).status(200)
    } catch (err) {
        return res.json({message:err.message})
    }
}

exports.register = async (req,res) =>{
    try {
        let error = validationResult(req)
        if (!error.isEmpty()) {
            console.log(error.array()[0].msg)
            return res.json({
                error : error.array()[0].msg
            }).status(422)
        }
        let {name,email,password} = req.body;
        console.log(req.body)
        
        let existingUser = await User.findOne({email:email});
        
        if(existingUser) {
            return res.json({message:"User already registered"}).status(422)
        }
        
        let hash = await bcrypt.genSalt(10)
        password = await bcrypt.hash(password,hash)
        let newUser = User({
            name:name,
            email:email,
            password:password,
        
        })
        await newUser.save()
        return res.json({message:"User registered successfully"}).status(200)
    } catch (err) {
        console.log(err.message);
    }
}


exports.search=async (req,res)=>{
    if(!req.body.email) {
        res.json({message:"Invalid email"})
    }
    const queryResult =   await User.find( { $text: { $search: req.body.email } } )
    res.json({message: queryResult})
}


exports.batchRegister = async (req,res)=> {
    try{   
        let form = new formidable.IncomingForm();
        form.uploadDir = "./upload";
        form.keepExtensions = true;
        form.parse(req,(err,fields,files)=>{
            if(Object.keys(files).length) {
                const workbook = XLSX.readFile(files.file.path);
                const sheet_name_list = workbook.SheetNames;
                const users = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
                
                users.forEach(async user => {
                    let existingUser = await User.findOne({email:user.email});
                    if(!existingUser) {
                        let hash = await bcrypt.genSalt(10)
                        let password = await bcrypt.hash(user.password.toString(),hash)
                        let newUser = User({
                            name:user.name,
                            email:user.email,
                            password:password,    
                        })
                        await newUser.save()
                    }
                });
            }
            res.json({message:"File imported successfully. Registration is in progress."})
        })
    } catch(err) {
        res.json({message:"File Not Found"})
    }
}