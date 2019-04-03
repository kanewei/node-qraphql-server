const validator = require('validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const utiliValitor = require('../utili/validator');
const jwt = require('jsonwebtoken');

module.exports = {
    createUser: async function({userInput}, req, res, next){
        try{
            const errors = [];
            if(!validator.isEmail(userInput.email)){
                errors.push({message: 'email invalid'})
            }

            if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 5})){
                errors.push({message: 'password invalid'})
            }

            if(validator.isEmpty(userInput.name)){
                errors.push({message: 'name invalid'})
            }

            if (errors.length > 0) {
                const error = new Error('Input invalid');
                error.data = errors;
                error.statusCode = 422;
                throw error;
            }

            const userExist = await User.findOne({email: userInput.email});

            if(userExist){
                const error = new Error('User exist');
                error.data = error;
                error.statusCode = 422;
                throw error;
            }

            const hashedPassword = await bcrypt.hash(userInput.password, 12);
            const user = new User({
                email: userInput.email,
                name: userInput.name,
                password: hashedPassword
            });

            const createdUser = await user.save();

             return {...createdUser._doc, _id: createdUser._id.toString()
        };
        }
        catch(err){
            if(!err.statusCode)
                err.statusCode = 500;

            next(err);
            return err;
        }
    },

    login: async function({email, password}, req, res, next){
        try{
            const user = await User.findOne({email: email});
            if(!user) {
                const error = new Error('User not found');
                error.data = error;
                error.statusCode = 404;
                throw error;
            }

            const isMatch = utiliValitor.passwordValidate(user, password);
            if(!isMatch){
                const error = new Error('Password not matched');
                error.data = error;
                error.statusCode = 404;
                throw error;
            }

            const token = jwt.sign({
                email: user.email,
                userId: user._id.toString()
            },
            'supersecretsecret', {
                expiresIn: '1h'
            });

            return {token: token, userId: user._id.toString()};
        }catch(err){
            if(!err.statusCode)
                err.statusCode = 500;
    
            return err;
        }
    }
}