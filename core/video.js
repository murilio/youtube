const gm = require('gm').subClass({
    imageMagick: true
})

const estado = require('./estado')
const spawn = require('child_process').spawn
const path = require('path')
const rootPath = path.resolve(__dirname, '..')

async function video() {
    console.log('> [Robô de vídeo] Iniciando...')
    const conteudo = estado.carregar()

    await converterTodasImagens(conteudo)
    await criarSentenca(conteudo)
    await criarThumbnail()
    await criarScriptAfeterAffects(conteudo)
    await renderizarVideo()

    estado.salvar(conteudo)

    async function converterTodasImagens(conteudo) {
        for (let sentencaIndex = 0; sentencaIndex < conteudo.sentencas.length; sentencaIndex++) {
            await converterImagem(sentencaIndex)
        }
    }

    async function converterImagem(sentencaIndex){
        return new Promise((resolve, reject) => {
            
        })
    }


}

module.exports = video