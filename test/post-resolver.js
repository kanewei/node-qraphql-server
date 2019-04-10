const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const postResolver = require('../graphql/resolvers');
const User = require('../models/user');
const Post = require('../models/post');

describe('User create post', function(){
    before(function(done){
        let mongodbUrl = 'mongodb://127.0.0.1:27017/test-post';
        mongoose.connect(mongodbUrl, {
            useNewUrlParser: true
        })
        .then(() => {
            const user = new User({
                email: 'test@test.com',
                password: '123123',
                name: 'Test',
                posts: [],
                _id: '5c9a1c4e1452f12db91e1d12'
            })
            return user.save();
        })
        .then(() => {
            done();
        });
    });

    it('Post user invalid', function(done){
        const req = {
            isAuth: false
        };

        postResolver.createPost({}, req, {}, () => {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.has.property('statusCode', 401);
        })
        .then(() => {
            done();
        });
    });

    it('Post title and content invalid', function(done){
        const req = {
            isAuth: true
        };

        const query = {
            postInput: {
                title: 'test',
                content: 'test'
            }
        };

        postResolver.createPost(query, req, {}, () => {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.have.property('statusCode', 422);
        })
        .then(() => {
            done();
        });
    });

    it('Post user not found', function(done){
        const req = {
            isAuth: true,
            userId: '5c9a1c4e1452f12db91e1d13'
        };

        const query = {
            postInput: {
                title: 'A item',
                content: 'Good itme'
            }
        };

        postResolver.createPost(query, req, {}, () => {}).then(result => {
            expect(result).to.be.an('error');
            expect(result).to.has.property('statusCode', 401);
        })
        .then(() => {
            done();
        });
    });

    it('Should return a result that has _id if successed', function(done){
        const req = {
            isAuth: true,
            userId: '5c9a1c4e1452f12db91e1d12'
        };
 
        const query = {
            postInput: {
                title: 'A item',
                content: 'Good item'
            }
        };

        postResolver.createPost(query, req, {}, () => {}).then(result => {
            expect(result).to.have.property('_id');
        })
        .then(() => {
            done();
        });
    });

    after(function(done){
        User.deleteMany({}).then(() => {
            mongoose.disconnect();
        }).then(() => {
            done();
        });
    });
});

describe('User get update delete post', function(){
    before(function(done){
        let mongodbUrl = 'mongodb://127.0.0.1:27017/test-login';
        mongoose.connect(mongodbUrl, {
            useNewUrlParser: true
        })
        .then(() => {
            const post = new Post({
                title: 'A Item',
                content: 'Good item',
                creator: '5c9a1c4e1452f12db91e1d12',
                _id: '5ca32b4b2f606f5cebbe57bf'
            })
            return post.save();
        })
        .then(() => {
            done();
        });
    });

    describe('Get post', function(){
        it('User invalid', function(done){
            const req = {
                isAuth: false
            };
            
            postResolver.getPosts({}, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 401)
            }).then(() => {
                done();
            });
        });

        it('Get posts', function(done){
            const req = {
                isAuth: true
            };

            postResolver.getPosts({}, req, {}, () => {}).then(result => {
                expect(result).to.have.property('posts');
            })
            .then(() => {
                done();
            });
        });
        
    });

    describe('Update post', function(){
        it('User invalid', function(done){
            const req = {
                isAuth: false
            };
            
            postResolver.updatePost({}, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 401)
            }).then(() => {
                done();
            });
        });

        it('Post data invalid', function(done){
            const req = {
                isAuth: true
            };

            const query = {
                postInput: {
                    title: 'test',
                    content: 'test'
                }
            };

            postResolver.updatePost(query, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 422);
            })
            .then(() => {
                done();
            });
        });

        it('Post not found', function(done){
            const req = {
                isAuth: true
            };

            const query = {
                postInput: {
                    title: 'A itme',
                    content: 'Good item'
                },
                id: '5ca32b4b2f606f5cebbe57bf'
            };
            
            sinon.stub(Post, 'findById').returns(null);


            postResolver.updatePost(query, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 404);
            })
            .then(() => {
                done();
                Post.findById.restore();
            });
        });

        it('User not owner', function(done){
            const req = {
                isAuth: true,
                userId: '5c9a1c4e1452f12db9112345'
            };

            const query = {
                postInput: {
                    title: 'A itme',
                    content: 'Good item'
                },
                id: '5ca32b4b2f606f5cebbe57bf'
            };

            postResolver.updatePost(query, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 403);
            })
            .then(() => {
                done();
            });
        });

        it('Should update post', function(done){
            const req = {
                isAuth: true,
                userId: '5c9a1c4e1452f12db91e1d12'
            };

            const query = {
                postInput: {
                    title: 'A itme',
                    content: 'Good item'
                },
                id: '5ca32b4b2f606f5cebbe57bf'
            };

            postResolver.updatePost(query, req, {}, () => {}).then(result => {
                expect(result).to.have.property('_id');
            })
            .then(() => {
                done();
            });
        });
    });

    describe('Delete post', function(){
        it('User invalid', function(done){
            const req = {
                isAuth: false
            };
            
            postResolver.deletePost({}, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 401);
            }).then(() => {
                done();
            });
        });

        it('Post not found', function(done){
            const req = {
                isAuth: true
            };

            const query = {
                id: '5ca32b4b2f606f5cebbe57bf'
            };

            sinon.stub(Post, 'findById').returns(null);

            postResolver.deletePost(query, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 404);
            })
            .then(() => {
                done();
                Post.findById.restore();
            });
        });

        it('User not owner', function(done){
            const req = {
                isAuth: true,
                userId: '5c9a1c4e1452f12db9112345'
            };

            const query = {
                id: '5ca32b4b2f606f5cebbe57bf'
            };

            postResolver.deletePost(query, req, {}, () => {}).then(result => {
                expect(result).to.be.an('error');
                expect(result).to.have.property('statusCode', 403);
            })
            .then(() => {
                done();
            });
        });

        it('Should delete post', function(done){
            const req = {
                isAuth: true,
                userId: '5c9a1c4e1452f12db91e1d12'
            };

            const query = {
                id: '5ca32b4b2f606f5cebbe57bf'
            };

            const user = new User({
                email: 'test@test.com',
                password: '123123',
                name: 'Test',
                posts: [],
                _id: '5c9a1c4e1452f12db91e1d12'
            });
            
            user.save().then(() => {
                postResolver.deletePost(query, req, {}, () => {}).then(result => {
                    expect(result).to.be.true;
                })
            }).then(() => {
                done();
            });
        });
    });

    after(function(done) {
        User.deleteMany({})
            .then(() => {
                return Post.deleteMany({})
            })
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
})