const {  EmbedBuilder } = require("discord.js");
const { getDoc } = require("firebase/firestore/lite");

module.exports = {
    async petStatus(message, petDocRef) {
        try {
            const petDocSnap = await getDoc(petDocRef);
            const petData = petDocSnap.data();
            const { level, health, petName } = petData;
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
                    { name: '\u200B', value: `❤️ **Health:** ${health}`, inline: true }
                )
                .setFooter({text: `${message.author.username}`})
                .setTimestamp();

            await message.channel.send({ embeds: [petEmbed] });
        } catch (error) {
            console.error(error);
            await message.channel.send("An error occurred while viewing your pet.");
        }
    }
}