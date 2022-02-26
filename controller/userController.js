const userDataBase = require('../models/mongoDB');
var jwt = require('jsonwebtoken');
const userRouter = require('./userRouter');
const { use } = require('./authRouter');
const JWT_KEY = 'skf453wdanj3rfj93nos';


module.exports.protectRoute = function protectRoute(req, res, next) {
    console.log("Outside protectRoute");
    // checking wether user is logged In or not using cookies (JWT encrypted cookies)
    try {

        // if isVerified token is Invalide then it will give an error and to the catch block 
        // and if it is true then isVerified will contain some payload value and pass the is statement 
        // we can also skip the if() conduction and directly write the statement inside it

        // req.cookies.isLoggedIn this hashValue contain payload (_id), so while verifying [_id] is not required
        
        console.log(req.cookies, req.headers['Authorization']);
        let JWTtoken = req.headers['Authorization'];

        let isVerified = jwt.verify(JWTtoken, JWT_KEY);                 // isVerified => payload

        if (isVerified) {
            res.locals.authenticated = true;
            res.locals.payload = isVerified;
            next();
        }
    }
    catch(err) {
        console.log("protechRoute",err);
        res.status(511).json({
            message: 'Please Login /protectRoute',
            statusCode : 511
            
        })
    }
}

module.exports.logoutUser = function logoutUser(req, res) {

    res.cookie('isLoggedIn', 'false', { maxAge: 1 });
    res.status(200).json({
        message: "User LogOut Successfully",
        statusCode : 200

    })
}

module.exports.getUserData = async function getUserData(req, res) {

    console.log("Working");

    if( !res.locals.authenticated){
        res.status(400).json({
            message: "Invalid Token TODO:",
            statusCode : 400
        })
    }    

    let dataObj = res.locals.payload;                               // payload => _id
    let userData = await userDataBase.findOne({ _id: dataObj.payload });

    res.status(200).json({
        message: "In the dashborad",
        res: userData,
        statusCode : 200
    })
}

module.exports.deleteAccount = async function deleteAccount(req, res) {


    let user_ID = jwt.verify(req.cookies.isLoggedIn, JWT_KEY).payload;
    let user = await userDataBase.findByIdAndDelete(user_ID);

    console.log("Account has been Deleted");

    res.cookie('isLoggedIn', 'false', { maxAge: 1000 });

    res.status(200).json({
        message: "Account has been Deleted",
        statusCode : 200,
        data: user
    })
}

module.exports.updateProfile = async function updateProfile(req, res) {

    try {
        let user_ID = jwt.verify(req.cookies.isLoggedIn, JWT_KEY).payload;
        let userData = await userDataBase.findById(user_ID);

        let dataToBeUpdated = req.body;

        const keys = [];
        for (let key in dataToBeUpdated) {
            keys.push(key);
        }

        for (let i = 0; i < keys.length; i++) {
            userData[keys[i]] = dataToBeUpdated[keys[i]];
        }

        await userData.save();         // update the data to mongoDB

        console.log("Data Updated successfully");
        res.status(200).json({
            message: "Data Updated successfully",
            data: userData,
            statusCode : 200
        })

    } catch (err) {
        res.status(500).json({
            message: err.message,
            statusCode : 500
        })
    }
}

