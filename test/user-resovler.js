const expect = require('chai').expect;
const mongoose = require('mongoose');
const sinon = require('sinon');

const userResovler = require('../graphql/resolvers');
const User = require('../models/user');
const validator = require('../utili/validator');

describe('User sign up and login', function(){
    before(function(done){
        let mongodbUrl = 'mongodb://127.0.0.1:27017/test';
        mongoose.connect(mongodbUrl, {
            useNewUrlParser: true
        })
        .then(() => {
            const user = new User({
                email: 'test@test.com',
                password: '123123',
                name: 'test'
            })

            return user.save();
        })
        .then(() => {
            done();
        })


    })

    it('sign up email, password, name invalid', function(done){
        const query = {
            userInput: {
                email: 'test',
                password: '123',
                name: ''
            }
        }

        userResovler.createUser(query, {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 422);
        })
        .then(() => {
            done();
        })
    });

    it('sign up email exist', function(done){
        const query = {
            userInput: {
                email: 'test@test.com',
                password: '123123',
                name: ''
            }
        }

        userResovler.createUser(query, {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 422);
        })
        .then(() => {
            done();
        })
    });

    it('sign up success', function(done){
        const query = {
            userInput: {
                email: 'successtest@test.com',
                password: '123123',
                name: 'test'
            }
        }

        userResovler.createUser(query, {}).then(result => {
            expect(result).to.have.property('_id');
        })
        .then(() => {
            done();
        })
    });

    it('login email not found', function(done){
        const query = {
            email: 'failtest@test.com',
            password: '123123'
        };

        userResovler.login(query, {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 404);
        })
        .then(() => {
            done();
        })
    });

    it('password not matched', function(done){
        const query = {
            email: 'test@test.com',
            password: '123123'
        };

        sinon.stub(validator, 'passwordValidate').returns(false);

        userResovler.login(query, {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.has.property('statusCode', 404);
        })
        .then(() => {
            done();
            validator.passwordValidate.restore();
        })
    });
    
    it('login success', function(done){
        const query = {
            email: 'test@test.com',
            password: '123123'
        };

        sinon.stub(validator, 'passwordValidate').returns(true);

        userResovler.login(query, {}).then(result => {
            expect(result).to.have.property('token');
        })
        .then(() => {
            done();
            validator.passwordValidate.restore();
        });   
    })

    after(function(done){
        User.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    })
})