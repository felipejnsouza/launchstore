
module.exports = {
    loginForm(require, response){
        return response.render("session/login");
    },
    login(require, response){
        require.session.userId = require.user.id;

        return response.redirect('/users');
        
    },
    logout(require, response){
        require.session.destroy();
        
        return response.redirect('/');
    }
}