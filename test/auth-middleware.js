const expect = require('chai').expect;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const authMiddleware = require('../middlewares/is-Auth');

describe('Auth middleware', function(){
    it('Throw error if no Authorization in header', function(){
        const req = {
            get: function(){
                return null;
            }
        }

        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('isAuth', false);
    });

    it('Throw error if only one string in authorization header', function(){
        const req = {
            get: function(){
                return 'one';
            }
        }

        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('isAuth', false);
    });

    it('token can not be verified', function(){
        const req = {
            get: function(){
                return 'bear one';
            }
        }

        sinon.stub(jwt, 'verify').returns(null);

        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('isAuth', false);

        jwt.verify.restore();
    });

    it('Token should have userId', function(){
        const req = {
            get: function(){
                return 'bear one';
            }
        }

        sinon.stub(jwt, 'verify').returns({userId: 'abc'});

        authMiddleware(req, {}, () => {});
        expect(req).to.have.property('userId');
        expect(req).to.have.property('isAuth', true);
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });
})