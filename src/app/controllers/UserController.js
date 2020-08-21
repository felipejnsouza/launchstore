const User = require('../models/User');

module.exports = {
    registerForm(require, response){
        return response.render('user/register');
    },
    show(require, response){
        response.send("ok, cadastrado");
    },
    async post(require, response){
        
        const userId = await User.create(require.body);


        return response.redirect('/users');
    }
};