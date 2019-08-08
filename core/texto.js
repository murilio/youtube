const algorithmia = require('algorithmia')
const chaveAlgorithmia = require('../api/algorithmia.json').apikey
const detectarSentenca = require('sbd')

const chaveWatson = require('../api/watson.nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1')

const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: chaveWatson,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api'
})

const estado = require('./estado')

async function texto() {
    console.log('> [Robô de texto] Iniciando...')
    const conteudo = estado.carregar()

    await pesquisaWikipedia(conteudo)
    limparConteudo(conteudo)
    dividirSentencas(conteudo)
    limitarMaximodeSentencas(conteudo)
    await separarPalavrasChave(conteudo)

    estado.salvar(conteudo)

    // baixar conteudo da wikipedia
    async function pesquisaWikipedia(conteudo) {
        console.log('> [Robô de texto] Buscando conteúdo na Wikipédia...')
        const autenticarAlgorithmia = algorithmia(chaveAlgorithmia)
        const WikipediaAlgorithimia = autenticarAlgorithmia.algo('web/WikipediaParser/0.1.2')
        const respostaWikipedia = await WikipediaAlgorithimia.pipe({
            "articleName": conteudo.pesquisa,
            "lang": 'pt'
        })
        const conteudoWikipedia = respostaWikipedia.get()
        conteudo.conteudoOriginal = conteudoWikipedia.content
        console.log('> [Robô de texto] Busca finalizada!\n')
    }

    // limpa os caracteres especias da wikipedia
    function limparConteudo(conteudo) {
        const linhasEmBranco = removerLinhasEmBranco(conteudo.conteudoOriginal)
        const datasEParenteses = removerCaracteres(linhasEmBranco)
        conteudo.conteudoLimpo = datasEParenteses

        function removerLinhasEmBranco(texto) {
            const todasLinhas = texto.split('\n')
            const linhasEmBranco = todasLinhas.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })
            return linhasEmBranco.join('')
        }
    }

    function removerCaracteres(texto) {
        return texto.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g, '')
    }

    function dividirSentencas(conteudo) {
        conteudo.sentencas = []
        const sentencas = detectarSentenca.sentences(conteudo.conteudoLimpo)
        sentencas.forEach((sentenca) => {
            conteudo.sentencas.push({
                texto: sentenca,
                palavrasChave: [],
                imagens: []
            })
        })
    }

    function limitarMaximodeSentencas(conteudo) {
        conteudo.sentencas = conteudo.sentencas.slice(0, conteudo.maxSentenca)
    }

    async function separarPalavrasChave(conteudo) {
        for (const sentenca of conteudo.sentencas) {
            function limitarMaximodeSentencas(conteudo) {
                conteudo.sentencas = conteudo.sentencas.slice(0, conteudo.maxSentenca)
            }
        }
    }

    async function separarPalavrasChave(conteudo) {
        console.log('> [Robô de texto] Iniciando a seleção das palavras chaves usando Watson...\n')
        for (const sentenca of conteudo.sentencas) {
            console.log(`> [Robô de texto] Sentença: "${sentenca.texto}"`)
            sentenca.palavrasChave = await palavrasChaveWatson(sentenca.texto)
            console.log(`> [Robô de texto] Palavras chaves: "${sentenca.palavrasChave.join(', ')}"\n`)
        }
    }

    async function palavrasChaveWatson(sentenca) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentenca,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    reject(error)
                    return
                }
                const keywords = response.keywords.map((keywords) => {
                    return keywords.text
                })
                resolve(keywords)
            })
        })
    }

}

module.exports = texto