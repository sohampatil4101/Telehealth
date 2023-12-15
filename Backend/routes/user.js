const express = require('express')
const User = require('../models/User')
const router = require('express').Router();
const {body, validationResult} = require('express-validator')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = 'masknxanxlanla';

const validate = [
    body('name', 'Enter a valid name').isLength({min:3}),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password must be atleast 5 characters and alphanumeric').isLength({min:5}).isAlphanumeric(),
]




// Route 1 to create user
router.post('/createuser', validate, async (req, res) =>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(404).json({errors: errors.array()})
    }
    
    try {
            // check wheather user exist!!
            let useremail = await User.findOne({email: req.body.email});
            let username = await User.findOne({name: req.body.name});
            if(useremail){
        return res.status(400).json({error: "sorry user with these email exist"})
            }
    else{
        const salt = await bcrypt.genSalt(10);
        let hashpassword = await bcrypt.hash(req.body.password, salt)
        const user = await User.create({
            name : req.body.name,
            email : req.body.email,
            password : hashpassword,
            })
        const data = {
            user:{
                id: user.id
            }
        }
        const jwtdata = jwt.sign(data, JWT_SECRET);
        res.json({jwtdata})
    }
    
}       
    
    catch (error) {
        console.log(error.message)
        res.status(500).send("Some error occured")
    }
    
    
})



// // Route 2 to authenticate user
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'password cannot be blank').exists()], 
    async (req, res) =>{
        let success = false
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(404).json({success, errors: errors.array()})
        }

        const{email, password} = req.body;
        try {
            const user = await User.findOne({email});
            if(!user){
                return res.status(400).json({success, error: "Please try to login with correct cridentials"})
            }
            const passwordcompare = await bcrypt.compare(password, user.password);
            if(!passwordcompare){
                return res.status(400).json({success, error: "Please try to login with correct cridentials"})
            }
            
        const data = {
            user:{
                id: user.id
            }
        }
        const jwtdata = jwt.sign(data, JWT_SECRET);
        success = true
        res.json({success, jwtdata})
        } 
        
           
        catch (error) {
        console.log(error.message)
        res.status(500).send("Internal server error occured")
    }
    }
    )

// // Route 3 to get logged in user details
//     router.get('/fetchuserdetails', fetchuser, async(req, res) =>{
//         try {
//             const details = await User.find({_id: req.user.id});
//             res.json(details)
//         } catch (error) {
//         console.log(error.message)
//         res.status(500).send("Some error occured")
//         }
//     })

// // Route 4 to update users details
// router.put('/updateuser/:id', fetchuser, async(req,res) =>{
//     try {
        
//         const salt = await bcrypt.genSalt(10);
//         let hashpassword = await bcrypt.hash(req.body.password, salt)

//         const {password, bio, education, phone} = req.body;
//         const newUser = {};
//         if(password){newUser.password = hashpassword}
//         if(bio){newUser.bio = bio}
//         if(education){newUser.education = education}
//         if(phone){newUser.phone = phone}

//         // Find the user to be updated
//         let user = await User.findById(req.params.id)
//         if(!user){
//             res.status(404).send("NOt found")
//         }
//         if(user.id.toString() !== req.user.id){
//             return res.status(401).send("Not allowed")
//         }

//         user = await User.findByIdAndUpdate(req.params.id, {$set: newUser}, {new: true});
//         res.send({user})

//     } 

//     catch (error) {
//         console.log(error.message)
//         res.status(500).send("Some error occured")
//     }
// })

module.exports = router