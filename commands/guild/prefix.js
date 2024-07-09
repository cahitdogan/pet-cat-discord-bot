const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { updateDoc, doc } = require("firebase/firestore/lite");
const { db } = require("../../firebase.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("prefix")
        .setDescription("Set a custom prefix for this server.")
        .addStringOption(option => 
            option.setName("prefix")
                .setMaxLength(7)
                .setDescription("WARNING: The prefix must start with a dot.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        const prefix = interaction.options.getString("prefix");

        if (!prefix.startsWith(".")) {
            await interaction.reply("Error! The prefix must start with a dot.");
            return;
        }

        const space = prefix.search(" ");

        if (space !== -1) {
            await interaction.reply("Error! The prefix cannot contain spaces.");
            return;
        }
        
        const guildID = interaction.guildId;
        const guildDocRef = doc(db, "guilds", guildID);
        await updateDoc(guildDocRef, { prefix: prefix });

        await interaction.reply("Prefix set successfully.");
    }
}