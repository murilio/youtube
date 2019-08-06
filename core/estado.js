const fs = require('fs')
const arquivoDeEstado = './conteudo.json'
const arquivodescript = './download/after-effects-script.js'

function salvar(conteudo){
    const conteudoString = JSON.stringify(conteudo)
    return fs.writeFileSync(arquivoDeEstado, conteudoString)
}

function salvarscript(conteudo){
    const conteudoString = JSON.stringify(conteudo)
    const scriptString = `var conteudo = ${conteudoString}`
    return fs.writeFileSync(arquivodescript, scriptString)
}

function carregar(){
    const arquivoDeBuffer = fs.readFileSync(arquivoDeEstado, 'utf-8')
    const arquivoJson = JSON.parse(arquivoDeBuffer)
    return arquivoJson
}

module.exports = {
    salvar,
    salvarscript,
    carregar
}
