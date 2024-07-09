const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { doc, getDoc } = require("firebase/firestore/lite");
const { db } = require("../../firebase.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("my-pets")
        .setDescription("Shows your pet list."),

    async execute(interaction) {
        const userID = interaction.user.id;
        const userName = interaction.user.username
        const userDocRef = doc(db, "users", userID);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            await interaction.reply(`<@${userID}> | You have not a pet.`);
            return;
        }

        const pets = userDocSnap.get("pets");

        if (pets.length === 0) {
            await interaction.reply(`<@${userID}> | You have not a pet.`);
            return;
        }

        let petListString = "";

        for (let i = 0; i < pets.length; i++) {
            petListString += `${i + 1}. ` + pets[i].petName + "\n";
        }
        
        const petsEmbed = new EmbedBuilder()
            .setColor("#FECEDE")
            .addFields({name: `${userName}'s Pets`, value: petListString})
            .setFooter({text: `${userName}`})
            .setTimestamp();

        await interaction.reply({ embeds: [petsEmbed] });
    }
}