const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        return;
    }

    const token = authHeader.split(' ')[1];
    if(!token){
        req.isAuth = false;
        return;
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'somesupersecretsecret');
    } catch (err) {
      req.isAuth = false;
      return;
    }

    if (!decodedToken) {
      req.isAuth = false;
      return;
    }

    req.userId = decodedToken.userId;
    req.isAuth = true;
    return;
}