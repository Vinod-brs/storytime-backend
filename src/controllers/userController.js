import User from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {
    sendEmailVerificationLink,
    EmailVerification,
    resetPasswordV,
    sendPasswordResetLink,
    sendVerificationCode,
    sendPasswordResetVerificationCode,
    
  } from "../utils/util.js";
import SpotifyWebApi from 'spotify-web-api-node';
import Language from '../models/languageModel.js';


//---------Create User----------------
    const createUser = async (req, res, next) => {
    
    let {first_name, last_name, email, password} = req.body
    first_name = first_name.trim()
    last_name = last_name.trim()
    email = email.trim()
    password = password.trim()
    try {
        if(!first_name || !last_name || !email || !password){
            const err = new Error ("FirstName, LastName, Email and Password is required");
            err.statusCode = 400;
            return next(err)
        }

        // valid email check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;

        if(!emailRegex.test(email)){
            res.status(400)
            const err = new Error("Invalid email address")
            return next(err)
        }

        // check user exist or not
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(400)
            const err = new Error("User with this email address already exists. Please use a different email address!")
            return next(err)
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10)


        // Generating Token
        const token = jwt.sign({email}, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        const mailInfo  = await sendEmailVerificationLink(email, token, first_name);

        if (mailInfo.error) {
            const err = new Error(
              "Failed to send verification email, please try again later"
            );
            err.statusCode = 500;
            return next(err);
          }

        // save user to DB
        const user = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            verify_token: token,
            verify_token_expires: Date.now() + 3600000, // + 7200000,
        });
       
        

          res.status(201).json({
            message:
              "Registered successfully. Please check your mail to verify the account",
          });
        
    } catch (error) {
        console.log(error)
        res.status(400)
            const err = new Error("unable to acess")
            return next(err)
    }   
};

//---------Verifying Email-----------------
    const verifyEmail = async (req, res, next) => {
        try{

        
         const vtoken = req.params.verifyToken;

        const user = await User.findOne({ verify_token: vtoken })
        if(user){
            if(user.verify_token_expires >= Date.now()){

                if(user.verified){
                    const mailInfo  = await EmailVerification(user.first_name, 'Your account is already verified. Please log in to continue.', 'token', 'none');
                    return res.send(mailInfo)
                }
                await User.updateOne(
                    { email: user.email }, 
                    { $set: { verified: true } } 
                    );
                
                const mailInfo  = await EmailVerification(user.first_name, 'Your account has been successfully verified. Please log in to your account to continue.', 'token', 'none');         
                return res.status(200).send(mailInfo)
            } 
            if(user.verified){    
                const mailInfo  = await EmailVerification(user.first_name, 'Your account is already verified. Please log in to continue.', 'token', 'none');         
                return res.status(200).send(mailInfo)
            }
            const mailInfo  = await EmailVerification(user.first_name, 'It seems your verification link has expired. Please click the button below to resend the account verification email.', user.verify_token, 'block');
            return res.status(200).send(mailInfo)
            }
            const mailInfo  = await EmailVerification("User", 'It appears that the token is invalid or something went wrong. Please try again.', 'user.verify_', 'none');
            return res.status(200).send(mailInfo)
        } catch (error) {
            console.log(error)
            res.status(400)
                const err = new Error("somthing went wrong, please try again later")
                return next(err)
        }  
    };

//---------Resending email if token Expires----------------
    const resendVerifyEmail = async (req, res, next) => {
        try{

        const token = req.params.token;
        const user = await User.findOne({ verify_token: token });
        
    if(user){
        if(user.verified){
            const mailInfo  = await EmailVerification(user.first_name, 'Your account is already verified. Please log in to continue.', 'token', 'none');         
            return res.status(200).send(mailInfo)
        }
        const email = user.email;
        const name = user.first_name;
        // Generating new Token
            const newToken = jwt.sign({email}, process.env.JWT_SECRET, {
                expiresIn: "1h"
            })
            const mailInfo  = await sendEmailVerificationLink(email, newToken, name);

            if (mailInfo.error) {

                const RemailInfo  = await EmailVerification(user.first_name, 'Failed to send verification email, please try again later.', 'token', 'none');         
                return res.status(200).send(RemailInfo)
            }
            await User.updateOne(
                { verify_token: token }, 
                { $set: { 
                    verify_token_expires: Date.now() + 3600000,
                    verify_token: newToken

                } } 
                );
                const RemailInfo  = await EmailVerification(user.first_name, 'We have sent you a new verification email, valid for the next 1 hour. Please check your inbox to complete the verification process.', 'token', 'none');         
                return res.status(200).send(RemailInfo)
    }
    const mailInfo  = await EmailVerification('User', ' It appears that the token is invalid or something went wrong. Please try again.', 'user.verify_', 'none');
        return res.status(200).send(mailInfo)

    } catch (error) {
        console.log(error)
        res.status(400)
            const err = new Error("somthing went wrong, please try again later")
            return next(err)
    }
    }

//---------Login----------------
    const login = async (req, res, next) => {
        try {
            
        
        let {email, password} = req.body;
        email = email.trim();
        password = password.trim();

        if(!email || !password){
            const err = new Error("required Email & Password");
                err.statusCode = 200;
                return next(err); 
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;

        if(!emailRegex.test(email)){
            res.status(400)
            const err = new Error("Invalid email address")
            return next(err)
        }
        

        const user = await User.findOne({email});
        if(!user){
            const err = new Error("User not Found please Register");
            err.statusCode = 404;
            return next(err);
        }
        
        if(!user.verified){
            
          return  res.status(200).json({
                message: "User is not varified. Please Verify your account if you dont receive email? resend verification email",
                href: user.verify_token,
            })
        }

        const validation = await bcrypt.compare(password, user.password)
        if(!validation){
            const err = new Error("Invalid email & password..!!")
            err.statusCode = 400;
            return next(err);
        }
        // Generating new token 
        const Token = jwt.sign({userId: user._id, email}, process.env.JWT_SECRET, {
            expiresIn: 2592000
        })
        user.token = Token;
        await user.save();

        // generating spotify token
        const spotifyAPI = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        })
        const spotifyCredentials = await spotifyAPI.clientCredentialsGrant()
        const spotifyToken = spotifyCredentials.body

        const tokenExp = 2592000
        return res.status(200).json({Token, spotifyToken, tokenExp})
     
    } catch (error) {
        return next(error)    
    }
    }

//---------Spotify Token----------------
    const generateSpotifyRefreshToken = async (req, res, next) => {
        try {
        // generating spotify token
        const spotifyAPI = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET
        })
        const spotifyCredentials = await spotifyAPI.clientCredentialsGrant()
        const spotifyToken = spotifyCredentials.body



        res.status(200).send({ spotifyToken })
        } catch (error) {
            const err = new Error("somthing went wrong, please try again later")
            err.statusCode = 500;
            return next(err)
        }
    }

//---------User Profile data----------------
    const getUserProfile = async (req, res, next) => {
    try{
        const user = await User.findById(req.user.id)
        if(!user){
            const err = new Error("User not found");
            err.statusCode = 404;
            return next(err);
        }
        const profieData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            languages: user.languages
        }
        
        res.status(200).json({ profieData })
    }catch(er){
        return next(er)
    }
    }

//---------Update User details----------------
    const updateUserProfile = async (req, res, next) => {
        const { first_name, last_name, email } = req.body;

        try{
            const user = await User.findById(req.user.id)
            if(!user){
            const err = new Error("User not found");
            err.statusCode = 404;
            return next(err);
            }
            if(first_name || last_name){
                user.first_name = first_name.trim() || user.first_name
                user.last_name = last_name.trim() || user.last_name
            }
            if(email && email !== user.email){
                const userExists = await User.findOne({ email })
                if(userExists){
                    const err = new Error(`${email} is already in use, please use a different one`);
                    err.statusCode = 409;
                    return next(err)
                }

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^s@]+$/;
                if(!emailRegex.test(email)){
                    res.status(400)
                    const err = new Error("Invalid email address")
                    return next(err)
                }
                user.email = email;
            }
            await user.save()
            res.status(200).json({ message: "updated successfully"})
        }catch(er){
            return next(er)
        }
        
    }

//---------User Preferred Language----------------
    const updatePreferredLanguage = async (req, res, next) => {
        const {languageIds} = req.body
        try {
            const user = await User.findById(req.user.id)
            if(!user){
            const err = new Error("User not found");
            err.statusCode = 404;
            return next(err);
            }
            user.languages = languageIds;
            await user.save();
            return res.status(200).json({message: "Preferred language updated successfully."})
            
        } catch (error) {
            return next(error)
        }
    }

//---------Update Password----------------
    const updatePassword = async (req, res, next) => {
        let {password} = req.body;
        try {

        if(!password){
            const err = new Error("Password is required without white space");
            err.statusCode = 400;
            return next(err);
        }

        const user = await User.findById(req.user.id)

        if(!user){
        const err = new Error("User not found");
        err.statusCode = 404;
        return next(err);
        }

        const hashedpassword = await bcrypt.hash(password, 10)
        user.password = hashedpassword;
        await user.save();
        return res.status(200).json({message: "password updated successfully."})
            
        } catch (error) {
            return next(error);
        }
    }

//---------Forgot Password----------------
    const forgotPassword = async (req, res, next) => {
        const {email} = req.body;
        
    try {
        if(!email){
            const err = new Error("Email is required");
            err.statusCode = 400;
            return next(err);
        }
        const user = await User.findOne({email});
        if(!user){
            const err = new Error("Email not found");
            err.statusCode = 404;
            return next(err);
        }

        const token = jwt.sign({userId: user._id, email}, process.env.JWT_SECRET, {
            expiresIn: "1h"
        })

        user.reset_password_token = token;
        user.reset_password_expires = Date.now() + 3600000
        await user.save()

        const mailInfo  = await sendPasswordResetLink(email, token, user.first_name);

        if (mailInfo.error) {
            const err = new Error(
            "Failed to send password reset link, please try again later"
            );
            err.statusCode = 500;
            return next(err);
        }

        return res.status(200).json({message: "Reset password link successfully sent to "+email+", please check your email"})



    } catch (error) {
        return next(error)
        
    }
    }

//---------Mail verify----------------
    const resetPassword = async (req, res, next) => {
    try {
        // const { token } = req.params;
        const { password, token } = req.body;
        // console.log(token)
        if(!token){
            const err = new Error("Token is required");
            err.statusCode = 400;
            return next(err)
        }
        if(!password){
            const err = new Error("password is required");
            err.statusCode = 400;
            return next(err)
        }

        //find user
        const user = await User.findOne({
            reset_password_token: token,
            reset_password_expires: {$gt: Date.now()}
        })
        if(!user){

            const resetView = await resetPasswordV('password reset link was expired', '123456789', 'none');
            return res.status(400).send(resetView)
        }
        //user found
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword;
        user.reset_password_expires = undefined;
        user.reset_password_token = undefined;
        await user.save()
        const resetView = await resetPasswordV('Successfully password updated. Please log in with new Password', '123456789', 'none');
        return res.status(200).send(resetView)
        // return res.status(200).json({message: "Successfully password updated"})
    } catch (error) {
        const resetView = await resetPasswordV('Something went wrong, please try again later ', '123456789', 'none');
        return res.status(400).send(resetView)
    }
    }

//---------Mail view redirect----------------
    const resetPasswordView = async (req, res, next) => {
        try{
        const { token } = req.params;

        const user = await User.findOne({ reset_password_token: token })
        
        if(!user){
            const resetView = await resetPasswordV('Reset password link was expired', '123456789', 'none');
            return res.status(404).send(resetView)
        }
        if(!(user.reset_password_expires >=Date.now())){
            const resetView = await resetPasswordV('Reset password link was expired', '123456789', 'none');
            return res.status(404).send(resetView)
        }
        const resetView = await resetPasswordV('Reset Password', token, 'block');
        res.status(200).send(resetView)

    }catch(error){

    }
    }

//---------Create User----------------
    const saveSpotifyStory = async (req, res, next) => {
      const { storyId } = req.body;
        try {
            
            if(!storyId){
                const err = new Error("StoryId is required");
                err.statusCode = 400
                return next(err)
            }

            const user = await User.findById(req.user._id)
            if(!user){
                const err = new Error("User not found");
                err.statusCode = 404
                return next(err)
            }

            if(user.saved_stories.includes(storyId)){
                return res.status(409).json({message: "Story already saved"})
            }
            user.saved_stories.push(storyId);
            await user.save();
            return res.status(200).json({message: "story saved successfully"});

        } catch (error) {
            return next(error)
        }

    }

//---------Remove User story----------------
    const removeSpotifyStory = async (req, res, next) => {
        const { storyId } = req.body;
        try {
            

            if(!storyId){
                const err = new Error("StoryId is required");
                err.statusCode = 400
                return next(err)
            }

            const user = await User.findById(req.user._id)
            if(!user){
                const err = new Error("User not found");
                err.statusCode = 404
                return next(err)
            }

            const index = user.saved_stories.indexOf(storyId)
            if(index === -1){
                const err = new Error("Invalid storyId");
                err.statusCode = 404
                return next(err)
            }
            
            user.saved_stories.splice(index, 1)
            
            await user.save();
            return res.status(200).json({message: "story removed successfully"});

        } catch (error) {
            return next(error)
        }

    }

//---------User saved stories----------------
    const getSpotifyStories = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
        if(!user){
            const err = new Error("User not found");
            err.statusCode = 404;
            return next(err);
        }

        const stories = user.saved_stories
        return res.status(200).json({stories});



    } catch (error) {
        const err = new Error("User not found");
            err.statusCode = 404;
        return next(err);
    }
    }


export
{
    createUser,
    verifyEmail,
    resendVerifyEmail, 
    login, 
    generateSpotifyRefreshToken, 
    getUserProfile, 
    updateUserProfile, 
    updatePreferredLanguage, 
    updatePassword, 
    forgotPassword, 
    resetPassword, 
    resetPasswordView, 
    saveSpotifyStory,
    removeSpotifyStory,
    getSpotifyStories
}