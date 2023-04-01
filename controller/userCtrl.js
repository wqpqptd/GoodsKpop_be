const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const { find } = require('../models/userModel');
const { generateToken } = require('../config/jwtToken');
const validateMonggodbId = require('./utils/validateMongodnId');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require("jsonwebtoken");

const createUser = asyncHandler(async(req, res) =>{
    const email = req.body.email;
    const findUser = await User.findOne({ email: email });
    if(!findUser){
        //Create new User
        const newUser = await User.create(req.body);
        res.json(newUser);
    }
    else{
        //User already exits
        throw new Error("User already exits");
    }
});

// login user
const loginUserCtrl = asyncHandler(async (req, res) =>{
    const {email, password} = req.body;
    // check if user exits or not
    const findUser = await User.findOne({ email });
    if(findUser && (await findUser.isPasswordMatched(password))){
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateuser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        },
        {
            new: true,
        }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    }
    else{
        throw new Error("Invalid Login");
    }
});

//handle refrash token

const handleRefreshToken = asyncHandler(async (req, res) =>{
    const cookie = req.cookies;
    console.log(cookie);
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("No refresh token present in db or not matched");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) =>{
        if(err || user.id !== decoded.id){
            throw new Error("There is somthing wrong with refresh token");
        }
        const accessToken =generateToken(user?._id)
        res.json({accessToken}); 
    });
});

// logout function

const logout = asyncHandler(async (req, res) =>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly: true, 
            secure: true,
        });
        return res.sendStatus(204);
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true, 
        secure: true,
    });
    res.sendStatus(204);
});

// update a user

const updatedUser = asyncHandler( async (req, res) =>{
    console.log();
    const {_id} = req.user;
    validateMonggodbId(_id);
    try{
        const updatedUser = await User.findByIdAndUpdate( _id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },
        {
            new: true,
        }
    );
    res.json(updatedUser);
    }
    catch(error){
        throw new Error(error);
    }
})
// get all user

const getAllUser = asyncHandler(async (req, res) =>{
    try{
    const getUsers = await User.find();
    res.json(getUsers);
    }
    catch (error){
        throw new Error(error);
    }
});

// get a single user

const getAUser = asyncHandler(async (req, res) => {
   
    const {id} = req.params;
    validateMonggodbId(id);
    try{
        const getAUser = await User.findById(id);
        res.json({
            getAUser,
        })
    }
    catch (error){
        throw new Error(error);
    }
});

// delete a single user

const deleteAUser = asyncHandler(async (req, res) => {
    
    const {id} = req.params;
    validateMonggodbId(id);
    try{
        const deleteAUser = await User.findByIdAndDelete(id);
        res.json({
            deleteAUser,
        })
    }
    catch (error){
        throw new Error(error);
    }
});

const blockUser = asyncHandler(async (req, res) =>{
    const {id} = req.params;
    validateMonggodbId(id);
    try{
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        },
        {
            new: true,
        }
        );
        res.json({
            message: "User blocked"
        });
    }
    catch(error){
        throw new Error ("error");
    }
});


const unblockUser = asyncHandler(async (req, res) =>{
    const {id} = req.params;
    validateMonggodbId(id);
    try{
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        },
        {
            new: true,
        }
        );
        res.json({
            message: "User Unblocked"
        });
    }
    catch(error){
        throw new Error ("error");
    }
});

module.exports = {
    createUser, 
    loginUserCtrl, 
    getAllUser, 
    getAUser, 
    deleteAUser,
    updatedUser,
    blockUser,
    unblockUser,
    handleRefreshToken,
    logout,
 };