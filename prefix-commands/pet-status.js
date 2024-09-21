const { EmbedBuilder } = require("discord.js");
const { getDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");

module.exports = {
    async petStatus(message, petDocRef) {

        let petDocSnap;
        try {
            petDocSnap = await getDoc(petDocRef);
        } catch (error) {
            console.error(error);
            await message.channel.send("There was a problem fetching pet information.");
            return;
        }

        const petData = petDocSnap.data();
        const { level, health, petName } = petData;
        const statsStrArr = ["water", "food", "sleep", "play", "shower", "toilet"];

        const statsArr = await Promise.all(statsStrArr.map(statStr => timeDependentDecrease(statStr, petDocRef)));

        const stats = {};
        for (let i = 0; i < statsStrArr.length; i++) {
            statsArr[i].value = parseFloat(statsArr[i].value.toFixed(2));
            const statStr = statsStrArr[i];
            stats[statStr] = statsArr[i];
        }

        const petEmbed = new EmbedBuilder()
            .setColor("#FECEDE")
            .setTitle(`${petName}`)
            .setImage('https://cdn.discordapp.com/attachments/1247190694481756160/1248683005447508118/Group_13.png?ex=66648e2b&is=66633cab&hm=2ee06ebf27971955f989cfa358fcb6bcb0489b16b56bcbbe1d8f6b8b3853fed2&')
            .addFields(
                { name: 'Water 💧', value: `${stats.water.value}`, inline: true },
                { name: 'Food 🥫', value: `${stats.food.value}`, inline: true },
                { name: 'Sleep 💤', value: `${stats.sleep.value}`, inline: true },
            )
            .addFields(
                { name: 'Play 🧶', value: `${stats.play.value}`, inline: true },
                { name: 'Shower 🧼', value: `${stats.shower.value}`, inline: true },
                { name: 'Toilet 💩', value: `${stats.toilet.value}`, inline: true },
            )
            .addFields(
                { name: '\u200B', value: `🏅**Lvl:** ${level}`, inline: true },
                { name: '\u200B', value: `❤️ **Health:** ${health}`, inline: true }
            )
            .setFooter({ text: `${message.author.username}` })
            .setTimestamp();

        await message.channel.send({ embeds: [petEmbed] });
    }
}