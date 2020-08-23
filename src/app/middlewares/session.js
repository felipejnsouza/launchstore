function OnlyUsers(require, response, next){
    if(!require.session.userId)
        return response.redirect('/users/login');

    next();
};

function isLoggedRedirectToUsers(require, response, next){
    if(require.session.userId)
        return response.redirect('/users');

    next();
};

module.exports = {
    OnlyUsers,
    isLoggedRedirectToUsers
};