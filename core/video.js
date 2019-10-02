const gm = require('gm').subClass({
    imageMagick: true
})

const estado = require('./estado')
const spawn = require('child_process').spawn
const path = require('path')
const rootPath = path.resolve(__dirname, '..')

async function video() {
    console.log('> [Robô de vídeo] Iniciando...\n')
    const conteudo = estado.carregar()

    await converterTodasImagens(conteudo)
    console.log('\n')
    await criarSentenca(conteudo)
    console.log('\n')
    await criarThumbnail()
    console.log('\n')
    await criarScriptAfeterAffects(conteudo)
    console.log('\n')
    await renderizarVideo()

    estado.salvar(conteudo)

    async function converterTodasImagens(conteudo) {
        for (let sentencaIndex = 0; sentencaIndex < conteudo.sentencas.length; sentencaIndex++) {
            await converterImagem(sentencaIndex)
        }
    }

    async function converterImagem(sentencaIndex) {
        return new Promise((resolve, reject) => {
            const arquivoEntrada = `./download/${sentencaIndex}-original.png[0]`
            const arquivoSaida = `./download/${sentencaIndex}-convertida.png`
            const largura = 1920
            const altura = 1080

            gm()
                .in(arquivoEntrada)
                .out("(")
                .out("-clone")
                .out("0")
                .out("-background", "white")
                .out("-blur", "0x9")
                .out("-resize", `${largura}x${altura}`)
                .out(")")
                .out("(")
                .out("-clone")
                .out("0")
                .out("-background", "white")
                .out("-resize", `${largura}x${altura}`)
                .out(")")
                .out("-delete", "0")
                .out("-gravity", "center")
                .out("-compose", "over")
                .out("-composite")
                .out("-extent", `${largura}x${altura}`)
                .write(`./download/${sentencaIndex}-convertida.png`, (error) => {
                    if (error) {
                        return reject(error)
                    }
                    console.log(`> [Robô de vídeo] Imagem convertida: ${arquivoSaida}`)
                    resolve()
                })
        })
    }

    async function criarSentenca(conteudo) {
        for (let sentencaIndex = 0; sentencaIndex < conteudo.sentencas.length; sentencaIndex++) {
            await criarSentencaImagem(sentencaIndex, conteudo.sentencas[sentencaIndex].texto)
        }
    }

    async function criarSentencaImagem(sentencaIndex, sentencaTexto) {
        return new Promise((resolve, reject) => {
            const arquivoSaida = `./download/${sentencaIndex}-sentenca.png`

            const modelo = {
                0: {
                    size: '1920x400',
                    gravity: 'center'
                },
                2: {
                    size: '800x1080',
                    gravity: 'west'
                },
                3: {
                    size: '1920x400',
                    gravity: 'center'
                },
                4: {
                    size: '1920x400',
                    gravity: 'center'
                },
                5: {
                    size: '800x1080',
                    gravity: 'west'
                },
                6: {
                    size: '1920x400',
                    gravity: 'center'
                }
            }

            gm()
                .out('-size', modelo[2].size)
                .out('-gravity', modelo[2].gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentencaTexto}`)
                .write(arquivoSaida, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log(`> [Robô de vídeo] Sentença criada: ${arquivoSaida}`)
                    resolve()
                })
        })
    }

    async function criarThumbnail() {
        return new Promise((resolve, reject) => {
            gm()
                .in('./download/0-convertida.png')
                .write('./download/thumbnail.jpg', (error) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log('> [Robo de vídeo] Thumbnail criada !')
                    resolve()

                })
        })
    }

    async function criarScriptAfeterAffects(conteudo) {
        await estado.salvarscript(conteudo)
    }

    async function renderizarVideo() {
        return new Promise((resolve, reject) => {
            const editordeVideo = 'C:/Program Files/Adobe/Adobe After Effects CC 2019'
            const template = `${rootPath}/template/1/template.aep`
            const arquivoFinal = `${rootPath}/download/video.mov`

            console.log('> [Robô de vídeo] Iniciando o editor de vídeo...')

            const editor = spawn(editordeVideo, [
                '-comp', 'main',
                '-project', template,
                '-ouput', arquivoFinal
            ])

            editor.stdout.on('data', (data) => {
                process.stdout.write(data)
            })

            editor.on('close', () => {
                console.log('> [Robô de vídeo] Finalizando o editor de vídeo !')
                resolve()
            })

        })
    }

}

module.exports = video