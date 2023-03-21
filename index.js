const Discord = require('discord.js');
const ytdl = require('ytdl-core')
const configs = require('./config.json');
const google = require('googleapis')

const youtube = new google.youtube_v3.Youtube({
    version: 'v3',
    auth: configs['GOOGLE KEY']
});


const client =  new Discord.Client();


const prefixo = configs.PREFIX;

const servidores = {
    'server': {
        connection: null,
        dispatcher: null,
        fila:[],
        estouTocando: false

    },
    'server': {
        connection: null,
        dispatcher: null,
        fila:[],
        estouTocando: false

    },
    'server': {
        connection: null,
        dispatcher: null,
        fila:[],
        estouTocando: false

    }
}

client.on("ready",() =>{
        console.log("Estou Online")
});

client.on("message", async (msg)=>{

    //filtro

    if(!msg.guild) return;

    if(!msg.content.startsWith(prefixo)) return;

    if(!msg.member.voice.channel) {
        msg.channel.send('barbaridade entre em um canal ');
        return;
    }

    //comandos

    if(msg.content === prefixo + 'join'){  //#join
        try{
            servidores.server.connection = await msg.member.voice.channel.join();

        }catch(err){
                console.log("Erro ao entrar no canal de voz")
                console.log(err);
        }
       
    }
    
    if(msg.content === prefixo + 'leave'){  //#leave
         msg.member.voice.channel.leave();
         servidores.server.connection = null;
         servidores.server.dispatcher = null;
         servidores.server.estouTocando = false;
         servidores.server.fila = []
     }

    if (msg.content.startsWith(prefixo +'play')){ //play
        let oQueTocar = msg.content.slice(6);

        if(oQueTocar.length=== 0){
            msg.channel.send('Bah guri coloca algo pra esse veio tocar aqui');
            return;
        }

        if(servidores.server.connection === null){
            try{
                servidores.server.connection = await msg.member.voice.channel.join();
    
            }catch(err){
                    console.log("Erro ao entrar no canal de voz")
                    console.log(err);
            }
        }

        if(ytdl.validateURL(oQueTocar)){
            servidores.server.fila.push(oQueTocar);

            tocaMusicas();
        }
        else {
            youtube.search.list({
                q: oQueTocar,
                part: 'snippet',
                fields: 'items(id(videoId),snippet(title,channelTitle))',
                type: "video"
            },function (err, resultado){
                if(err){
                    console.log(err);
                }
                if(resultado){
                  const listaResultados = [];

                  //organiza o resultado da pesquisa
                  for (let i in resultado.data.items){
                        const montaItem = {
                            'tituloVideo':resultado.data.items[i].snippet.title,
                            'nomeCanal':resultado.data.items[i].snippet.channelTitle,
                            'id': 'https://www.youtube.com/watch?v='+ resultado.data.items[i].id.videoId
                        }

                        listaResultados.push(montaItem);
                  }
                  const embed = new Discord.MessageEmbed()
                  .setColor([193,17,199])
                  .setTitle('estou tocando gurizada')
                  .setDescription('bora tomar um chimas gurizada')
                  .setAuthor('bah gurizada outro musicâo adicionado');

                for(let i in listaResultados){
                      embed.addField(
                          `${parseInt(i)+ 1}:${listaResultados[i].tituloVideo}`,
                          listaResultados[i].nomeCanal
                      ); 
                  } 
                        msg.channel.send(embed) 
                        .then((embedMessage)=>{
                            const possiveisReacoes =['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣' ];
                                //reage
                            for(let i = 0; i < possiveisReacoes.length; i++){
                               embedMessage.react(possiveisReacoes[i]);
                            };


                            const filter = (reaction , user)=>{
                                return possiveisReacoes.includes(reaction.emoji.name)
                                && user.id === msg.author.id;
                            }
                            embedMessage.awaitReactions(filter,{max: 1 , time: 20000, errors:['time']})
                            .then((collected)=>{
                                const reaction = collected.first();
                                const idOpcaoEscolhida = possiveisReacoes.indexOf(reaction.emoji.name)

                                msg.channel.send(`bah guri você escolheu essa ne? Jaguara ${listaResultados[idOpcaoEscolhida].tituloVideo} de ${listaResultados[idOpcaoEscolhida].nomeCanal}`);


                                servidores.server.fila.push(listaResultados[idOpcaoEscolhida].id);
                                tocaMusicas();

                            }).catch((error)=>{
                                 msg.reply('bah ce nao escolheu uma opção valida meu filho');
                                 console.log(error)
                            });
                        });
                }
            });
        }
    }

    if(msg.content === prefixo + 'pause'){  //#pause
        servidores.server.dispatcher.pause();
     } 

     if(msg.content === prefixo + 'resume'){  //#resume
        servidores.server.dispatcher.resume();
     } 

});


const tocaMusicas = () =>{
        if(servidores.server.estouTocando===false){
            
   const Tocando = servidores.server.fila[0];
   servidores.server.estouTocando = true;
    servidores.server.dispatcher= servidores.server.connection.play(ytdl(Tocando, configs.YTDL));

    servidores.server.dispatcher.on('finish',()=>{
        servidores.server.fila.shift();
        servidores.server.estouTocando = false;
        if(servidores.server.fila.length > 0){
            tocaMusicas();
        }
        else{
            servidores.server.dispatcher = null;
        }
    });

   }
}

client.login(configs.TOKEN_DISCORD);