// Dependencies
const Discord = require('discord.js');
const dotenv = require('dotenv');
const Cryptr = require('cryptr');
const dialogflow = require('@google-cloud/dialogflow');
const reply = require('./functions/response');
const MongoDB = require('mongodb');

// Variables
const config = require('./serviceAccount.json');
dotenv.config();

// App
const client = new Discord.Client();
const cryptr = new Cryptr(process.env.asdf);
MongoDB.connect(`mongodb+srv://user:${cryptr.decrypt(process.env.DBPW)}@cluster0.pfjp3.mongodb.net/ai?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(c => {
    client.db = c.db('ai').collection('data');
});

// Client
client.on("ready", () => {
    console.log(`${client.user.tag} 에 로그인됨`);
    setInterval(() => {
        switch (Math.floor(Math.random() * 4)) {
            case 0:
                client.user.setActivity(`${client.ws.ping} ms`);
                break;
            case 1:
                client.user.setActivity(`${client.guilds.cache.size} 서버`);
                break;
            case 2:
                client.user.setActivity(`${client.users.cache.size} 유저`);
                break;
            case 3:
                client.user.setActivity(`맨션`, {
                    type: 'WATCHING'
                });
                break;
        }
    }, 10000);
});

client.once("reconnecting", () => {
    client.user.setActivity('다시 연결하는 중')
    console.log("reconnecting");
});

client.once("disconnect", () => {
    client.user.setActivity('Disconnect')
    console.log("disconnecting");
});


client.on('message', async message => {
    if (message.author.bot) return;
    if (!message.channel.members)   console.log('dm'); 
    if (!message.guild) return;
    if (!message.content.startsWith(process.env.PREFIX)) return;

    // const args = message.content.slice(process.env.PREFIX.length)
    // .trim()
    // .split(/ +/g);

    // let inputSynonyms = args.slice(1).join(' ').split(',');
    // let dataDB = await client.db.findOne({value: `${args[0]}`});
    // if (dataDB) {
    //     client.db.findOneAndUpdate({value: `${args[0]}`}, {
    //         $push: {
    //             synonyms: dataDB.synonyms.concat(inputSynonyms),
    //         }
    //     });
    // } else {
    //     client.db.insertOne({
    //         value: `${args[0]}`,
    //         synonyms: inputSynonyms,
    //     });
    // }
    // message.reply('배웠습니다');

    const input_text = message.content.substr(process.env.PREFIX.length + 1);

    if (input_text.length <= 0) return message.reply('대화봇이에요!');

    try {
        let credentialsConfig = {
            credentials: {
              private_key: config.private_key,
              client_email: config.client_email,
            }
          };
        const sessionClient = new dialogflow.SessionsClient(credentialsConfig);
        const sessionPath = sessionClient.projectAgentSessionPath(config.project_id, message.author.id);
        const request = {
        session: sessionPath,
        queryInput: {
            text: {
            text: input_text,
            languageCode: "ko-KR",
            }
        }
        };
        const response = await sessionClient.detectIntent(request);
    
        console.log(response[0].queryResult.action);
        console.log(response[0].queryResult.parameters.fields);
    
        reply(response, message);
    } catch (e) {
        message.reply('뭔가 잘못됬어요!');
    }
})

client.login(cryptr.decrypt(process.env.TOKEN));