const { EmbedBuilder } = require("discord.js");
const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");

module.exports = {
    async petStatus(message, petDocRef) {
        const statsStrArr = ["water", "food", "sleep", "play", "shower", "toilet"];
        const statsArr = await Promise.all(statsStrArr.map(statStr => timeDependentDecrease(statStr, petDocRef)));

        const stats = {};
        for (let i = 0; i < statsStrArr.length; i++) {
            statsArr[i].value = statsArr[i].value.toFixed(0);
            const statStr = statsStrArr[i];
            stats[statStr] = statsArr[i];

            if (stats[statStr].value <= 50) {
                await updateDoc(petDocRef, { allStatsGreaterThan50: false });
            }
        }

        const petDocSnap = await getDoc(petDocRef);
        const pet = petDocSnap.data();
        const { level, petName, allStatsGreaterThan50, allStatsGreaterThan50Timestamp} = pet;
        let health = pet.health;

        if (allStatsGreaterThan50) {
            health = health + (Date.now() - allStatsGreaterThan50Timestamp) * 0.00005;
            await updateDoc(petDocRef, { health: health, allStatsGreaterThan50Timestamp: Date.now() });
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
                { name: '\u200B', value: `❤️ **Health:** ${health.toFixed(0)}`, inline: true }
            )
            .setFooter({ text: `${message.author.username}` })
            .setTimestamp();

        await message.channel.send({ embeds: [petEmbed] });
    }
}