async function post(require, response, next){
    const keys = Object.keys(require.body);

    for(key of keys){
        if(require.body[key] == "") {
            return response.send('Por favor, volte e preencha todos os campos')
        };
    };

    if(!require.files || require.files.length == 0) {
        return response.send('Por favor, envie pelo menos 1 imagem!')
    };

    next();
};

async function put(require, response, next){
    const keys = Object.keys(require.body);

    for(key of keys){
        if(require.body[key] == "" && key != "removed_files") {
            return response.send('Por favor, volte e preencha todos os campos!')
        };
    };

    next();
}

module.exports = {
    post,
    put
};