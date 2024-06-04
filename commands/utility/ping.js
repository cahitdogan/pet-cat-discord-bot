const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Yanıt olarak 'pong' yazar.");


async function execute(interaction) {
    await interaction.reply("pong");
}

module.exports = {
    data,
    execute
}