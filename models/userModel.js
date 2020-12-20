const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        minLength:8,
        required:[true, 'Please tell us your name!!!']
    },
    email:{
        type:String,
        required:[true, 'Please enter your email!!!'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail, 'Please provide valid email!!']
    },
    photo:{
        type:String
    },
    role:{
        type:String, 
        enum:['user', 'guide', 'lead-guide', 'admin'],
        default:'user'
    },
    password:{
        type:String,
        minLength: 8,
        required:[true, 'Please provide a password!'],
        select:false 
    },
    confirmPassword:{
        type:String,
        required:[true, 'Confirm password is important!'],
        validate:{
            // this only works on save and create (in the authController) 
            validator:function(el){
                return el === this.password;
            },
            message:"The passwords do not match"
        }
    },
    passwordChangedAt: Date
});

UserSchema.pre('save', async function(next) {

    // only run this function if the password was actually modified
    if(!this.isModified('password')) return next(); 

    // encrypt the password with cost 12 and then save it 
    this.password = await bcrypt.hash(this.password, 12);

    //remove the confirmPassword field
    this.confirmPassword = undefined;
})

///Instance method tyo check if the user entered right password, which will then be available fro every document throughout our application

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword, userPassword);
    //this is the only way of chceking if paswseord is valid as our candidate passowrd is a normal string and userPassword is an encrypted password string 
}

UserSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimeStamp; 
    }
    return false; //default in case user does not change password
}

const UserModel = mongoose.model('User', UserSchema); 

module.exports = UserModel;  