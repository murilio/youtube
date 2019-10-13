const robos = {
    pesquisa: require('./core/pesquisa'),
    texto: require('./core/texto'),
    imagem: require('./core/imagem'),
    video: require('./core/video'),
    youtube: require('./core/youtube')
}

async function iniciar() {

    // robos.pesquisa()
    // await robos.texto()
    await robos.imagem()
    await robos.video()
    // await robos.youtube()

}

iniciar()
