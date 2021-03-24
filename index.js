const Discord = require('discord.js');
let config  = require('./config.json');
const db = require("quick.db")
const fs = require("fs");
const { join } = require("path");
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const { Client, MessageEmbed, MessageAttachment, Collection } = require('discord.js');
require('dotenv').config();
client.commands = new Collection();
client.aliases = new Collection();
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});
///////CLIENT READY
client.on("ready", async (message, msg) => { 
  client.user.setActivity(db.get(`status`))
  console.log(`Logged in as ${client.user.tag}!`)
})
///////CLIENT PREFIX COMMANDS ESTANDAR

client.on("message", msg => { 

    if(msg.author.bot) return; 
    if(msg.channel.type === "dm") return;

    let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
    if(!prefixes[msg.guild.id]){
       prefixes[msg.guild.id] = {
        prefix: config.DEFAULT_PREFIX 
       }
    }

    let prefix = prefixes[msg.guild.id].prefix; //Let prefix be prefixes[msg.guild.id].prefix

    if (!msg.content.startsWith(prefix)) return; //If mesage isn't start with prefix then return
    const args = msg.content.slice(prefix.length).split(' '); //Config Args(Arguements)
    const command = args.shift().toLowerCase();
    if(command === 'setprefix') { //if the command is setprefix
    
      if(!msg.member.hasPermission("MANAGE_GUILD")) return msg.channel.send("<:__:729707887399534653> No tienes permisos suficientes!"); //If The Author Doesnt Have Manage guild permission return a message
      if(!args[0]) return msg.channel.send("<:__:729707887399534653> Especifica tu nuevo prefix!"); //If there isn't a prefix then return a message
      
      let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8")); //Read File
      prefixes[msg.guild.id] = { //Let The config be
      prefix: args[0] //Let prefix = arguement 1
      }
      
      fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => { //Write File
        if(err) console.log(err); //If error log error to the console
      })
      
      msg.channel.send(`Prefix cambiado a: **${args[0]}**!`); //send message to that channel
      return; //return
    }
    if(command === 'test') { //If the command is test

     msg.channel.send('testeando!'); //Send message
     return; //return
    }
});

client.on("message", async message => {

    if (message.author.bot) return;
    if (!message.guild) return;
  
  
    let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8")); //Read File
    if(!prefixes[message.guild.id]){  //If there is no string that is startwith prefixes[msg.guild.id]
       prefixes[message.guild.id] = { //Let prefixes[msg.guild.id] be
        prefix: config.DEFAULT_PREFIX //Prefix = Default Prefix Which is on confiฌ.json
       }
    }

    let prefix = prefixes[message.guild.id].prefix; //Let prefix be prefixes[msg.guild.id].prefix

  
    if (!message.content.startsWith(prefix)) return;

    // If message.member is uncached, cache it.
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    
    // Get the command
    let command = client.commands.get(cmd);
    // If none is found, try to find it by alias
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    // If a command is finally found, run the command
    if (command) 
        command.run(client, message, args);
});

///////CLIENT MEMBER ADD
client.on('guildMemberAdd', member => {
    console.log(member.user.tag);
});
///////CLIENT ANTISPAM DISCORD
client.on("message", async message => {
  const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|club)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi;
  if (regex.exec(message.content)) {
    await message.delete({timeout: 10});
      await message.channel.send(
        `${message.author} **No puedes enviar servidores de discord.**`
      );
  }
});

//channel.updateOverwrite(channel.guild.roles.everyone, { VIEW_CHANNEL: false });
//STAFF > > > >  770569929618751538

const channelName = '「🎮JUGANDO」'

const getVoiceChannels = (guild) => {
  return guild.channels.cache.filter((channel) => {
    return channel.type === 'voice' && channel.name === channelName
  })
}


  client.on('voiceStateUpdate', (oldState, newState) => {
    const { guild } = oldState
    const joined = !!newState.channelID

    const channelId = joined ? newState.channelID : oldState.channelID
    let channel = guild.channels.cache.get(channelId)

    console.log(
      `${newState.channelID} vs ${oldState.channelID} (${channel.name})`
    )

    if (channel.name === channelName) {
      if (joined) {
        const channels = getVoiceChannels(guild)

        let hasEmpty = false

        channels.forEach((channel) => {
          if (!hasEmpty && channel.members.size === 0) {
            hasEmpty = true
          }
        })

        if (!hasEmpty) {
          const {
            type,
            userLimit,
            bitrate,
            parentID,
            permissionOverwrites,
            rawPosition,
          } = channel

          guild.channels.create(channelName, {
            type,
            bitrate,
            userLimit,
            parent: parentID,
            permissionOverwrites,
            position: rawPosition,
          })
        }
      } else if (
        channel.members.size === 0 &&
        getVoiceChannels(guild).size > 1
      ) {
        channel.delete()
      }
    } else if (oldState.channelID) {
      channel = guild.channels.cache.get(oldState.channelID)
      if (
        channel.name === channelName &&
        channel.members.size === 0 &&
        getVoiceChannels(guild).size > 1
      ) {
        channel.delete()
      }
    }
  })

/////////////////////


client.login(config.BOT_TOKEN);
