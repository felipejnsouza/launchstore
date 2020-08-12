const Mask = {
    apply(input, functionName){
        setTimeout(() => {
            input.value = Mask[functionName](input.value)
        }, 1);
    },
    formatBRL(value){
        value = value.replace(/\D/g,"")

        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value/100);
    }
};