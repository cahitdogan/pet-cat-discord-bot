const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Send a ping to server");


async function execute(interaction) {
    await interaction.reply("Meow!");
}

module.exports = {
    data,
    execute
}