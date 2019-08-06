const robos = {
    pesquisa: require('./core/pesquisa'),
    texto: require('./core/texto'),
    imagem: require('./core/imagem'),
    video: require('./core/video')
}

async function iniciar() {

    robos.pesquisa()
    await robos.texto()
    await robos.imagem()
    await robos.video()

}

iniciar()