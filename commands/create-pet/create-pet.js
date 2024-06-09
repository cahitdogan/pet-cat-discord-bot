const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { collection, setDoc, doc, getDocFromServer, getDocsFromServer } = require("firebase/firestore");
const { usersCollectionRef } = require("@root/firebase.js");

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName("create-pet")
        .setDescription("Creates a new pet.")
        .addStringOption(option => 
            option.setName("pet-name")
                .setMaxLength(20)
                .setDescription("Your pet's name")
                .setRequired(true)),

    async execute(interaction) {
        const petName = interaction.options.getString("pet-name");
        const userID = interaction.user.id;
        const userName = interaction.user.username;

        const userDocRef = doc(usersCollectionRef, userID);

        if (!(userID === "1124456694102102088")) { //for developer\tester
            if (getDocsFromServer(petCollectionRef)) {
                await interaction.reply("You already have a pet.");
                return;
            }
        }

        const petID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        
        const petsCollectionRef = collection(userDocRef, "pets");
        const petDocRef = doc(petsCollectionRef, petID);
        const now = Date.now();

        try {
            await setDoc(userDocRef, {
                coin: 0,
                pets: [
                    { petID: petID, owner: true },
                ]
            })

            await setDoc(petDocRef, {
                ownerName: userName,
                petName: petName,
                level: 0,
                exp: 0,
                health: 100,
                stats: {
                    water: {value: 100, timestamp: now},
                    food: {value: 100, timestamp: now},
                    sleep: {value: 100, timestamp: now},
                    play: {value: 100, timestamp: now},
                    shower: {value: 100, timestamp: now},
                    toilet: {value: 100, timestamp: now},
                },
                accessories: {}
            });
        } catch (error) {
            await interaction.reply("Error creating pet!");
            return;
        }

        await interaction.reply(`Congratulations **${userName}** ! Your pet has been created. `);

        try {
            const userDocSnap = await getDocFromServer(userDocRef);
            const userData = userDocSnap.data();

            const petDocSnap = await getDocFromServer(petDocRef);
            const petData = petDocSnap.data();

            const { coin } = userData;
            const { level, health } = petData;
            const { water, food, sleep, play, shower, toilet} = petData.stats;

            const petEmbed = new EmbedBuilder()
                .setColor("#FECEDE")
                .setTitle(`${petName}`)
                .setImage('https://cdn.discordapp.com/attachments/1247190694481756160/1248683005447508118/Group_13.png?ex=66648e2b&is=66633cab&hm=2ee06ebf27971955f989cfa358fcb6bcb0489b16b56bcbbe1d8f6b8b3853fed2&')
                .addFields(
                    { name: 'Water 💧', value: `${water.value}`, inline: true },
                    { name: 'Food 🥫', value: `${food.value}`, inline: true },
                    { name: 'Sleep 💤', value: `${sleep.value}`, inline: true },
                )
                .addFields(
                    { name: 'Play 🧶', value: `${play.value}`, inline: true },
                    { name: 'Shower 🧼', value: `${shower.value}`, inline: true },
                    { name: 'Toilet 💩', value: `${toilet.value}`, inline: true },
                )
                .addFields(
                    { name: '\u200B', value: `🏅**Lvl:** ${level}`, inline: true },
                    { name: '\u200B', value: `❤️ **Health:** ${health}`, inline: true },
                    { name: '\u200B', value: `💰 **Coin:** ${coin}`, inline: true }
                )
                .setFooter({text: `${userName}`})
                .setTimestamp();

            await interaction.followUp({ embeds: [petEmbed] });
        } catch (error) {
            console.error(error);
            await message.followUp("An error occurred while viewing your pet.");
        }
    }
}