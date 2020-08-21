const User = require('../models/User');


async function post(require, response, next){
    // check if has all fields
    const keys = Object.keys(require.body);

    for(key of keys){
        if(require.body[key] == "") {
            return response.render('user/register', {
                user: require.body,
                error: 'Por favor, preencha todos os campos!'
            });
        };
    };

    //check if user exists [email,cpf_cnpj]
    let { email, cpf_cnpj, password, passwordRepeat } = require.body;

    cpf_cnpj = cpf_cnpj.replace(/\D/g, "");

    const user = await User.findOne({ 
        where: { email },
        or: { cpf_cnpj }
    });

    if(user) return response.render('user/register', {
        user: require.body,
        error: 'Usuário já cadastrado.'
    });

    //check if password matches
    if(password != passwordRepeat)
        return response.render('user/register', {
            user: require.body,
            error: 'As senhas são diferentes!'
        });

    next()
}

module.exports = {
    post
};