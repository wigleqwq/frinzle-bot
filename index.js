const Discord = require('discord.js') 
const intents = new Discord.Intents()
const client = new Discord.Client({
  disableEveryone: true,
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_PRESENCES", "GUILD_MESSAGE_REACTIONS"]
})
const { Client, MessageEmbed, Guild, Util, } = require('discord.js');
require('dotenv').config();
const { MessageButton, MessageActionRow } = require('discord.js')
const keepAlive = require('./server.js')
const express = require('express')
const zeew = require('zeew-eco');
const chalk = require('chalk')
const db = require('megadb')
const alt = require('discord-anti-alt')
const config = require('./config.js')
const app = express()
const qdb = require('quick.db')
const token = "OTM3OTYyMjAzMzIyMTMwNDMy.Gb9KFl.nj-xggTigaER9PBQBk6m_X5aPWoRNwEYyniaGs"
app.get('/', (req, res) => {
  res.send('Bot Loaded! Changes Saved!');
});

app.listen(3000, () => {
  console.log(
    chalk.white('['),
    chalk.cyan('Express'),
    chalk.white(']'),
    chalk.gray(':'),
    chalk.white('Connected')
  );
});

const fs = require('fs')
const { readdirSync } = require('fs')

const mongo = require('mongoose')
mongo.connect(config.mongo, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}).then(console.log(
    chalk.white('['),
    chalk.green('MongoDB'),
    chalk.white(']'),
    chalk.gray(':'),
    chalk.white('Connected')
  ));

client.commands = new Discord.Collection()

let carpetas = fs.readdirSync('./comandos/').map((subCarpetas) => {
  const archivos = fs.readdirSync(`./comandos/${subCarpetas}`).map((comandos) => {
    let comando = require(`./comandos/${subCarpetas}/${comandos}`)
    client.commands.set(comando.name, comando)
  })
})
///slash cmds
client.slashcommands = new Discord.Collection();
const slashcommandsFiles = fs.readdirSync("./slashcmd").filter(file => file.endsWith("js"))

for(const file of slashcommandsFiles){
  const slash = require(`./slashcmd/${file}`)
  console.log(`Slash commands - ${file} cargado.`)
  client.slashcommands.set(slash.data.name, slash)
}

client.on("interactionCreate", async(interaction) => {
  if(interaction.isButton()){
    if(interaction.customId === "tickets"){
      const everyone = interaction.guild.roles.cache.find(r => r.name === "@everyone")
      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        type: "GUILD_TEXT",
        parent: "940831360170471436",
        permissionsOverwrites: [
          {
            id: interaction.user.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"]
          },
          {
            id: everyone.id,
            deny: ["VIEW_CHANNEL"]
          }
        ]
      }).then(c => {
        const mensaje = new Discord.MessageEmbed()
        .setTitle(`¡Bienvenid@ a tu ticket, ${interaction.user.tag}.`)
        .setColor("RANDOM")
        .setTimestamp()
        .setDescription('**Por favor espera a que un staff venga a atenderte lo más antes posible, mientras tanto, redacta un poco sobre tu problema, duda o reporte.**')
        .setFooter(`Ticket de ${interaction.user.username}`)

        c.send({ content: `Ping: ||@everyone / @here||`, embeds: [mensaje] })
      })

      interaction.reply({ content: `**<@${interaction.user.id}>, ¡Ticket creado correctamente!**`, ephemeral: true })
    }
    if(interaction.customId === "verificar"){
      const { Captcha } = require("captcha-canvas")

      const captcha = new Captcha()
      captcha.async = false
      captcha.addDecoy()
      captcha.drawTrace()
      captcha.drawCaptcha()

      const attachment = new Discord.MessageAttachment(captcha.png, "captcha.png")

      interaction.reply({ content: `<@${interaction.user.id}>, **Resuelve el captcha poniendo los mimos numeros y/o letras que hay en la imagen para ser verificado. Tienes un minuto para completarlo.**`, files: [attachment], ephemeral: true })

      const filter = m => m.author.id === interaction.user.id;

      const collector = interaction.channel.createMessageCollector({ filter, time: 60000})
      let leftAttempts = 3;
      collector.on("collect", async m => {
        setTimeout(() => {
          m.delete()
        }, 1000)
        if(m.content !== captcha.text){
          leftAttempts--
          if(leftAttempts == 1){
            m.author.send({
              content: '**Te has quedado sin intentos y has sido expulsado.**'
            })
            m.member.kick('Verificación - No ha completado el captcha correctamente.')
          }
          m.channel.send(`<a:incorrecto:939065496714756158> | **Código Incorrecto, te quedan ${leftAttempts} intentos.**`).then(xd => {
            setTimeout(() => {
             xd.delete() 
            
            }, 5000)
          })
        } else {
        await m.member.roles.add("940851799932407818")
      m.channel.send(`<a:correcto:939061785502318642> **${interaction.user.username} haz sido verificado correctamente!**`).then(v => {
        setTimeout(() => {
          v.delete()

        }, 5000)
      })
      collector.stop()
        }
      })

      
    
      
    }
  }
  if(!interaction.isCommand()) return;

  const slashcmds = client.slashcommands.get(interaction.commandName)

  if(!slashcmds) return;

  try{
    await slashcmds.run(client, interaction)
  } catch(e) {
    console.error(e)
  }
})
///slash cmds
for(const file of readdirSync('./eventos')){
  if(file.endsWith('.js')){
    let fileName = file.substring(0, file.length - 3)
    let fileContents = require(`./eventos/${file}`)
    client.on(fileName, fileContents.bind(null, client))
  }
}

process.on("unhandledRejection", (reason, p) => {
   console.log(chalk.gray("—————————————————————————————————"));
   console.log(
      chalk.white("["),
      chalk.red.bold("AntiCrash"),
      chalk.white("]"),
      chalk.gray(" : "),
      chalk.white.bold("Unhandled Rejection/Catch")
   );
   console.log(chalk.gray("—————————————————————————————————"));
   console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
   console.log(chalk.gray("—————————————————————————————————"));
   console.log(
      chalk.white("["),
      chalk.red.bold("AntiCrash"),
      chalk.white("]"),
      chalk.gray(" : "),
      chalk.white.bold("Uncaught Exception/Catch")
   );
   console.log(chalk.gray("—————————————————————————————————"));
   console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
   console.log(chalk.gray("—————————————————————————————————"));
   console.log(
      chalk.white("["),
      chalk.red.bold("AntiCrash"),
      chalk.white("]"),
      chalk.gray(" : "),
      chalk.white.bold("Multiple Resolves")
   );
   console.log(chalk.gray("—————————————————————————————————"));
   console.log(type, promise, reason);
});

const { GiveawaysManager } = require("discord-giveaways");
client.giveaways = new GiveawaysManager(client, {
    storage: "./giveaways.json",
    updateCountdownEvery: 10000,
    default: {
    botsCanWin: false,
    embedColor: "#303136",
    reaction : "🎉",
    embedColorEnd: '#303136'
    }
});

//mencion bot

client.on('message', async(message) => {
  if(message.content.match(new RegExp(`^<@!?${client.user.id}>( |)`))){
   
   
   const mencion = new Discord.MessageEmbed()
   .setAuthor(message.author.tag, message.author.displayAvatarURL())
   .setTitle('**Ayuda <:help:940062812355588096>**')
   .setDescription(`**¡Hola! Mi prefix predeterminado es \`,\`. \nUtiliza \`,help\` para más  información.** <a:aura_unlem:939081528149966878>`)
   .setColor('RANDOM')
   .setTimestamp()

   const invitacion = new Discord.MessageActionRow()
   .addComponents(
   new MessageButton()
   .setLabel("Invitame!")
   .setStyle('LINK')
   .setURL('https://discord.com/api/oauth2/authorize?client_id=937962203322130432&permissions=8&scope=bot%20applications.commands')
)
    const soporte = new Discord.MessageActionRow()
   .addComponents(
   new MessageButton()
   .setLabel('Soporte')
   .setStyle('LINK')
   .setURL('https://discord.gg/Dg6kQYChQ4')
)
  
    const msg = await message.channel.send({
     embeds: [mencion],
     components: [invitacion]
    })

    new zeew.Options("")



 } 
}) 
 

 client.login("OTM3OTYyMjAzMzIyMTMwNDMy.Gb9KFl.nj-xggTigaER9PBQBk6m_X5aPWoRNwEYyniaGs")