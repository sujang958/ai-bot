const dialogflow = require('@google-cloud/dialogflow');
const { MessageEmbed } = require('discord.js');
const { default: fetch } = require('node-fetch');


module.exports = 
/**
 * @param {[dialogflow.protos.google.cloud.dialogflow.v2.IDetectIntentResponse, dialogflow.protos.google.cloud.dialogflow.v2.IDetectIntentRequest, {}]} response 
 * @param {import('discord.js').Message} message 
 */
async (response, message) => {
    const event = response[0].queryResult.action;
    const parameters = response[0].queryResult.parameters.fields;

    if (event == 'input.discord.weather') {
        if (parameters.hasOwnProperty('korea-place')) {
           if (parameters['korea-place'].stringValue != '') {
                let res = await fetch(`http://sujang.dothome.co.kr/API/weather.php?place=${encodeURI(parameters['korea-place'].stringValue)}`);
                res = await res.json();
                let embed = new MessageEmbed()
                .setAuthor(`${parameters['korea-place'].stringValue}의 날씨 정보!`)
                .setColor(`GREEN`)
                .addField(`현재 온도`, `${res.현재온도} 도`, true, false)
                .addField(`최저 온도`, `${res.최저온도} 도`, true, false)
                .addField(`최고 온도`, `${res.최고온도} 도`, true, true)
                .addField(`미세먼지`, `${res.미세먼지}`, true, false)
                .addField(`초 미세먼지`, `${res.초미세먼지}`, true, false)
                .addField(`오존`, `${res.오존}`, true, false)
                .setTimestamp()

                message.reply(embed);
            } else {
                return message.channel.send('**지역을 찾을수가 없네요**...!');
            } 
        } else {
            return message.channel.send('**지역을 찾을수가 없네요**...!');
        } 
    } else {
        return message.reply(response[0].queryResult.fulfillmentText.replace(`{{user}}`, `${message.author.tag}`));
    }
};