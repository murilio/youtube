const imageDownloader = require('image-downloader')
const google = require('googleapis').google
const googlePesquisa = google.customsearch('v1')
const credenciasGoogle = require('../api/googlecloud.json')

const estado = require('./estado')

async function imagem() {
    console.log('> [Robô de imagens] Iniciando...\n')
    const conteudo = estado.carregar()

    await pesquisarTodasImagens(conteudo)
    console.log('\n')
    await baixarTodasImagens(conteudo)
    console.log('\n')

    estado.salvar(conteudo)

    async function pesquisarTodasImagens(conteudo) {
        for (let sentencaIndex = 0; sentencaIndex < conteudo.sentencas.length; sentencaIndex++) {
            let pergunta

            if (sentencaIndex === 0) {
                pergunta = `${conteudo.pesquisa}`
            } else {
                pergunta = `${conteudo.pesquisa} ${conteudo.sentencas[sentencaIndex].palavrasChave[0]}`
            }

            console.log(`> [Robô de imagens] Busca no Google Imagens: ${pergunta}`)

            conteudo.sentencas[sentencaIndex].imagens = await linkDasImagens(pergunta)
            conteudo.sentencas[sentencaIndex].pesquisaGoogle = pergunta
        }
    }

    async function linkDasImagens(pergunta) {
        const response = await googlePesquisa.cse.list({
            auth: credenciasGoogle.apikey,
            cx: credenciasGoogle.mecanisnodeBusca,
            q: pergunta,
            searchType: 'image',
            imgDominantColor: 'blue',
            imgSize: 'xxlarge',
            num: 2
        })

        const urlImagem = response.data.items.map((item) => {
            return item.link
        })

        return urlImagem

    }

    async function baixarTodasImagens(conteudo) {
        conteudo.baixarImagens = []

        for (let sentencaIndex = 0; sentencaIndex < conteudo.sentencas.length; sentencaIndex++) {
            const imagens = conteudo.sentencas[sentencaIndex].imagens

            for (let imagensIndex = 0; imagensIndex < imagens.length; imagensIndex++) {
                const urlImagens = imagens[imagensIndex]

                try {
                    if (conteudo.baixarImagens.includes(urlImagens)) {
                        throw new Error('Imagem já baixada!')
                    }

                    await salvarImagems(urlImagens, `${sentencaIndex}-original.png`)
                    conteudo.baixarImagens.push(urlImagens)
                    console.log(`> [Robô de imagens] Baixou a imagem com sucesso: ${sentencaIndex}-original.png`)
                    break;
                } catch (error) {
                    console.log(`> [Robô de imagens] Error ao baixar (${urlImagens})`)
                }
            }
        }
    }

    async function salvarImagems(url, nomedoArquivo) {
        return imageDownloader.image({
            url: url,
            dest: `./download/${nomedoArquivo}`
        })
    }

}

module.exports = imagem