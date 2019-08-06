// robo para pegar a pesquisa do usuário
const busca = require('readline-sync')
const estado = require('./estado')

async function pesquisa(){

    const conteudo = {
        maxSentenca: 7
    }

    conteudo.pesquisa = buscaWikipedia()
    estado.salvar(conteudo)

    function buscaWikipedia(){
        return busca.question('> [Robô de pesquisa] Digite um termo de busca na Wikipédia: \n> [Robô de pesquisa] ')
    }

}

module.exports = pesquisa
