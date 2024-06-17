const { SlashCommandBuilder } = require("discord.js");
const { doc, getDoc } = require("firebase/firestore/lite");
const { db } = require("../../firebase.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("my-coins")
        .setDescription("How many coins do you have?"),

    async execute(interaction) {
        try {
            const userDocRef = doc(db, "users", interaction.user.id);
            const userDocSnap = await getDoc(userDocRef);
            let coins = userDocSnap.get("coins");
            coins = coins.toLocaleString("en-US");

            await interaction.reply(`:coin: | **${interaction.user.username}** you currently have **${coins}** coins!`);
        } catch (error) {
            console.error(error);
            await interaction.reply("An error occurred while displaying coins.");
        }
    }
}