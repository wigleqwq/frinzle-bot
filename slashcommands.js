const Discord = require("discord.js")
const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { clientId } = require("./config.js")
const commands = []
const slashcommandsFiles = fs.readdirSync("./slashcmd").filter(file => file.endsWith("js"))
const config = require("./config.js")

for(const file of slashcommandsFiles){
  const slash = require(`./slashcmd/${file}`)
  commands.push(slash.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(config.token)

createSlash()

async function createSlash(){
  try{
    await rest.put(
      Routes.applicationCommands(clientId), {
        body: commands
      }
    )
    console.log("Slash commands agregados.")
  } catch(e) {
    console.error(e)
  }
}