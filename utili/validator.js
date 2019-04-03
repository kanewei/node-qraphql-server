const bcrypt = require('bcryptjs');

exports.passwordValidate = (user, password) => {
    let isMatched = bcrypt.compare(password, user.password).then(result => {
        return result;
    });

    return isMatched;
}