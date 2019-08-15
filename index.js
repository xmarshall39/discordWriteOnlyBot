//Set our global constants
const Discord = require('discord.js');
const{
    //-> Command Starters
    singelePrefix, //Message one person
    allPrefix, //Message all in server
    anonSinglePrefix, //Message one person anonymously
    anonAllPrefix, //Message all anonymously
    //
    serverName, //Ensures that communication only takes place in server
    sendChannelSuffix,  //Starting characters of a write-only channel
    receiveChannelSuffix, //Starting characters of a read-only channel
    allowAnon,  //Toggle the use of anonymous messaging.
    //-> Flavor text for the bot
    randomMessages,
    randomAnonMessages,
    //
    token
} = require('./config.json');
const client = new Discord.Client();

//INPUT: Message object and bools for multi and anonymous messages.
//OUTPUT: Sends message to one user. Returns bool denoting send success
function RelayMessage(message, all, anon){
    var firstWord = message.content.split(" ")[0];
    var recipientNickname = (firstWord.substr(1, firstWord.length)).toLowerCase();
    var flavorText = anon ? RandomAnonPhrase() : (message.member.nickname + RandomPhrase());
    var sent = false;
    
    client.guilds.forEach((guild) => {

        guild.channels.forEach((channel) =>{
            //The first word of the single message is the recipient identifier excluded in relay
            if(!all && channel.name == recipientNickname + receiveChannelSuffix){


                channel.send(flavorText + message.content.substr(firstWord.length + 1, message.content.length))
                .then(console.log)
                .catch(console.error);
                sent = true;
            }

            else if(all && channel.name.includes(receiveChannelSuffix)){
                channel.send(flavorText + message.content.substr(1, message.content.length))
                .then(console.log)
                .catch(console.error);
                sent = true;
            }

        })
    });
    return sent;
}

//OUTPUT: Random phrase from config array
function RandomPhrase(){
    return randomMessages[Math.floor(Math.random()*(randomMessages.length))];
}

//OUTPUT: Random anonymous phrase from config array
function RandomAnonPhrase(){
    return randomAnonMessages[Math.floor(Math.random()*(randomAnonMessages.length))];
}




//Boot the bot
client.once('ready', () =>{
    console.log('Carl-Bot reporting for duty!')
    
    client.guilds.forEach((guild) => {
        console.log(guild.name)

        guild.channels.forEach((channel) =>{
            console.log(` -${channel.name} ${channel.type} ${channel.id}`)
        })
    })
})



client.on('message', message =>{
    if(!message.author.bot && message.channel.name.includes(sendChannelSuffix)){
    
        console.log(message.content);
        var success = false;
        //Relay the message if command prefix given
        //React to original message with success or failure
        switch(message.content[0]){
                case singelePrefix:
                success = RelayMessage(message, false, false);
                success ? message.react('👍🏿') : message.react('👎🏿');
                break;

                case allPrefix:
                success = RelayMessage(message, true, false);
                success ? message.react('👍🏿') : message.react('👎🏿');
                break;

                case anonSinglePrefix:
                if(allowAnon){
                    success = RelayMessage(message, false, true);
                    success ? message.react('👍🏿') : message.react('👎🏿');
                }
                else message.react('👎🏿').then(console.log).catch(console.error);
                break;

                case anonAllPrefix:
                if(allowAnon){
                    success = RelayMessage(message, true, true);
                    success ? message.react('👍🏿') : message.react('👎🏿');
                    }
                    else message.react('👎🏿').then(console.log).catch(console.error);
                break;
                
                //Fail all other cases
                default:
                message.react('👎🏿').then(console.log).catch(console.error);
                break;
            }

        }

})



client.login(token);