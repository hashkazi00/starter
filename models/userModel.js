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
    }
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

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;  