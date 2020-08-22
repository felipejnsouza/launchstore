const User = require('../models/User');
const { compare } = require('bcryptjs');


function checkAllFields(body){
    const keys = Object.keys(body);

    for(key of keys){
        if(body[key] == "") {
            return {
                user: body,
                error: 'Por favor, preencha todos os campos!'
            };
        };
    };
};

async function show(require, response, next){
    const { userId: id } = require.session;

        const user = await User.findOne({ where: {id} });

        if(!user) return response.render('user/register', {
            erro: "Usuário não encontrado."
        })

        require.user = user;
    next();
};
async function post(require, response, next){
    // check if has all fields
    const fillAllFields = checkAllFields(require.body);
    if(fillAllFields){
        return response.render('user/register', fillAllFields) 
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
};
async function update(require, response, next){
    //check if has all fields
    const fillAllFields = checkAllFields(require.body);
    if(fillAllFields){
        return response.render('user/index', fillAllFields) 
    };

    //check if has password
    const { id, password } = require.body;

    if(!password) return response.render('user/index', {
        user: require.body,
        error: "Coloque sua senha para atualizar seu cadastro."
    });

    const user = await User.findOne({ where: {id} });

    const passed = await compare(password, user.password);
    
    if(!passed) return response.render('user/index', {
        user: require.body,
        error: "Senha incorreta."
    });

    require.user = user;

    next();
};

module.exports = {
    post,
    show,
    update
};