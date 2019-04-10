const validator = require('validator');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const Post = require('../models/post');
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
    },

    createPost: async function({postInput}, req, res, next) {
        try{
            if (!req.isAuth) {
                const error = new Error('Not Authenticated!');
                error.data = error;
                error.statusCode = 401;
                throw error;
            }

            const errors = [];
            if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {
                    min: 5
                })) {
                errors.push({
                    message: 'Title is invaild'
                });
            }
            if (validator.isEmpty(postInput.content) | !validator.isLength(postInput.content, {
                    min: 5
                })) {
                errors.push({
                    message: 'Content is invalid'
                });
            }
            if (errors.length > 0) {
                const error = new Error('Input invalid');
                error.data = errors;
                error.statusCode = 422;
                throw error;
            }

            const user = await User.findById(req.userId);
            if(!user){
                const error = new Error('User not found');
                error.data = error;
                error.statusCode = 401;
                throw error;
            }

            const post = new Post({
                title: postInput.title,
                content: postInput.content,
                creator: user
            });

            const createdPost = await post.save();
            user.posts.push(createdPost);
            await user.save();

            return {
                ...createdPost._doc,
                _id: createdPost._id.toString(),
                createdAt: createdPost.createdAt.toISOString(),
                updatedAt: createdPost.updatedAt.toISOString()
            };
        }catch(err){
            if(!err.statusCode)
                err.statusCode = 500;

            return err;
        }
    },

    getPosts: async function(args, req, res, next){
        try{

            if (!req.isAuth) {
                const error = new Error('Not Authenticated!');
                error.data = error;
                error.statusCode = 401;
                throw error;
            }

            const posts = await Post.find().populate('creator');

            return {posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                }
            })};
        }catch(err){
            if(!err.statusCode)
                err.statusCode = 500;
    
            return err;
        } 
    },

    updatePost: async function({id, postInput}, req, res, next){
        try{
            if (!req.isAuth) {
                const error = new Error('Not Authenticated!');
                error.statusCode = 401;
                throw error;
            }
    
            const errors = [];
            if (validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {
                    min: 5
                })) {
                errors.push({
                    message: 'Title is invaild'
                });
            }
            if (validator.isEmpty(postInput.content) | !validator.isLength(postInput.content, {
                    min: 5
                })) {
                errors.push({
                    message: 'Content is invalid'
                });
            }
            if (errors.length > 0) {
                const error = new Error('Input invalid');
                error.data = errors;
                error.statusCode = 422;
                throw error;
            }

            const post = await Post.findById(id);

            if (!post) {
                const error = new Error('Post invalid');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error('Not Authenticated!');
                error.statusCode = 403;
                throw error;
            }
    
            post.title = postInput.title;
            post.content = postInput.content;
    
            const updatePost = await post.save();

            result = await Post.findById(updatePost.id).populate('creator');

            return {
                ...result._doc,
                _id: result._id.toString(),
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString()
            };
        }catch(err){
            if(!err.statusCode)
                err.statusCode = 500;
    
            return err;
        } 
    },

    deletePost: async function({id}, req, res, next){
        try{
            if (!req.isAuth) {
                const error = new Error('Not Authenticated!');
                error.statusCode = 401;
                throw error;
            }

            const post = await Post.findById(id);
            if(!post){
                const error = new Error('Post not found!');
                error.statusCode = 404;
                error.data = error;
                throw error;
            }

            if(post.creator.toString() !== req.userId){
                const error = new Error('Not Authenticated');
                error.statusCode = 403;
                error.data = error;
                throw error;
            }

            await Post.findByIdAndDelete(id);

            const user = await User.findById(req.userId);
            user.posts.pull(id);
            await user.save();

            return true;
        }catch(err){
            if(!err.statusCode)
                err.statusCode = 500;
    
            return err;
        } 
    }
}