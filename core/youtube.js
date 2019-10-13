const express = require('express')
const estado = require('./estado')
// Autenticação do OAuth2
const google = require('googleapis').google
const OAuth2 = google.auth.OAuth2
// api do YouTube
const youtube = google.youtube({
    version: "v3"
})
const fs = require('fs')

async function roboYoutube() {

    console.log('> [Robô do YouTube] Iniciando... \n')
    const conteudo = estado.carregar()

    await autenticarOAth()
    const informacoesVideo = await uploadVideo(conteudo)
    await uploadThumbnail(informacoesVideo)

    async function autenticarOAth() {
        const servidorWeb = await iniciarServidor()
        const autorizarCliente = await criarAutorização()
        permitirUsuario()
        const tokendeAutorização = await retornoDoGoole(servidorWeb)
        await autorizacaoDoGoogle(autorizarCliente, tokendeAutorização)
        await passarAutorizacao(OAuth2)
        await pararServidor(servidorWeb)

        // inicia o servidor
        async function iniciarServidor() {
            return new Promise((resolve, reject) => {
                const porta = 5000
                const programa = express()

                const servidor = programa.listen(porta, () => {
                    console.log(`> [Robô do YouTube] Processando em http://localhost:${porta}`)

                    resolve({
                        programa,
                        servidor
                    })
                })
            })
        }

        // cria as credencias para o OUth2
        async function criarAutorização() {
            const credencial = require('../api/googleYoutube.json')

            const autorizarCliente = new OAuth2(
                credencial.web.client_id,
                credencial.web.client_secret,
                credencial.web.redirect_uris[0]
            )

            return autorizarCliente
        }

        // autorização do usuário
        function permitirUsuario() {
            const permissaoUrl = autorizarCliente.generateAuthUrl({
                access_type: 'offline',
                scope: ['https://www.googleapis.com/auth/youtube']
            })

            console.log(`> [Robô do YouTube] Por favor, dê sua permissão: >> ${permissaoUrl}`)
        }

        // conceder permissão do Google
        async function retornoDoGoole(servidorWeb) {
            return new Promise((resolve, reject) => {
                console.log('> [Robô do YouTube] Esperando autorização do usuário...')

                servidorWeb.programa.get('/callback', (req, res) => {
                    const codigodeAcesso = req.query.code
                    console.log(`> [Robô do YouTube] Permissção concedida: ${codigodeAcesso}`)

                    res.send('<h1>Obrigado!</h1><p>Já pode fechar está aba.</p>')
                    resolve(codigodeAcesso)
                })
            })
        }

        // tokens de acesso
        async function autorizacaoDoGoogle(autorizarCliente, tokendeAutorização) {
            return new Promise((resolve, reject) => {
                autorizarCliente.getToken(tokendeAutorização, (error, tokens) => {
                    if (error) {
                        return reject(error)
                    }

                    console.log('> [Robô do YouTube] Tokens de acesso recebido!')

                    autorizarCliente.setCredentials(tokens)
                    resolve()
                })
            })
        }

        // deixar o usuaŕio sempre autorizado
        function passarAutorizacao(autorizarCliente) {
            google.options({
                auth: autorizarCliente
            })
        }

        // parar o servidor 
        async function pararServidor(servidorWeb) {
            return new Promise((resolve, reject) => {
                servidorWeb.servidor.close(() => {
                    resolve()
                })
            })
        }

    }

    async function uploadVideo(conteudo) {
        const arquivoVideo = './download/video.mp4'
        const tamanhoVideo = fs.statSync(arquivoVideo).size
        const tituloVideo = `${conteudo.pesquisa}`
        const tagsVideo = [conteudo.pesquisa, ...conteudo.sentencas[0].palavrasChave]
        const descricaoVideo = conteudo.sentencas.map((sentenca) => {
            return sentenca.text
        }).join('\n\n')

        const parametrosdoVideo = {
            part: 'snippet, status',
            requestBody: {
                title: tituloVideo,
                description: descricaoVideo,
                tags: tagsVideo
            },
            status: {
                privacyStatus: 'unlisted'
            },
            media:  {
                body: fs.createReadStream(arquivoVideo)
            }
        }

        console.log('> [Robõ do YouTube] Iniciando o upload do vídeo...')
        const respostaYoutube = await youtube.videos.insert(parametrosdoVideo, {
            onUploadProgress: onUploadProgress
        })

        console.log(`> [Robô do YouTube] Vídeo disponivel em: https://youtu.be/${respostaYoutube.data.id}`)
        return respostaYoutube.data

        function onUploadProgress(e){
            const progresso = Math.round((e.bytesRead / tamanhoVideo) * 100)
            console.log(`> [Robô do YouTube] ${progresso}% completo...`)
        }

    }

    async function uploadThumbnail(informacoesVideo) {
        const videoId = informacoesVideo.id
        const thumbnail = './download/thumbnail.jpg'

        const parametrosdoVideo = {
            videoId: videoId,
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(thumbnail)
            }
        }

        const respostaYoutube = await youtube.thumbnails.set(parametrosdoVideo)
        console.log(`> [Robô do YouTube] Upload da Thumbnail`)
    }

}

module.exports = roboYoutube