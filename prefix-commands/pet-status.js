const { EmbedBuilder } = require("discord.js");
const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");

module.exports = {
    async petStatus(message, petDocRef) {
        //statsGreaterThan50Counter'ın son durumu
        let petDocSnap = await getDoc(petDocRef);
        const lastValueOfStatsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");

        const stats = {};
        stats.water = await timeDependentDecrease("water", petDocRef);
        stats.food = await timeDependentDecrease("food", petDocRef);
        stats.sleep = await timeDependentDecrease("sleep", petDocRef);
        stats.play = await timeDependentDecrease("play", petDocRef);
        stats.shower = await timeDependentDecrease("shower", petDocRef);
        stats.toilet = await timeDependentDecrease("toilet", petDocRef);

        petDocSnap = await getDoc(petDocRef);
        const pet = petDocSnap.data();
        const { level, petName, statsGreaterThan50Counter, allStatsGreaterThan50Timestamp, firstWhenWillReach50Value} = pet;
        let health = pet.health;

        if (lastValueOfStatsGreaterThan50Counter === 6 && statsGreaterThan50Counter === 6) {
            health = health + (Date.now() - allStatsGreaterThan50Timestamp) * 0.00005;
            if (health > 100) health = 100;
            await updateDoc(petDocRef, { health: health, allStatsGreaterThan50Timestamp: Date.now() });
        } else if (lastValueOfStatsGreaterThan50Counter === 6 && statsGreaterThan50Counter < 6) {
            health = health + (firstWhenWillReach50Value - allStatsGreaterThan50Timestamp) * 0.00005;
            if (health > 100) health = 100;
            await updateDoc(petDocRef, { health: health });
        }

        const petEmbed = new EmbedBuilder()
            .setColor("#FECEDE")
            .setTitle(`${petName}`)
            .setImage('https://cdn.discordapp.com/attachments/1247190694481756160/1248683005447508118/Group_13.png?ex=66648e2b&is=66633cab&hm=2ee06ebf27971955f989cfa358fcb6bcb0489b16b56bcbbe1d8f6b8b3853fed2&')
            .addFields(
                { name: 'Water 💧', value: `${stats.water.value.toFixed(0)}`, inline: true },
                { name: 'Food 🥫', value: `${stats.food.value.toFixed(0)}`, inline: true },
                { name: 'Sleep 💤', value: `${stats.sleep.value.toFixed(0)}`, inline: true },
            )
            .addFields(
                { name: 'Play 🧶', value: `${stats.play.value.toFixed(0)}`, inline: true },
                { name: 'Shower 🧼', value: `${stats.shower.value.toFixed(0)}`, inline: true },
                { name: 'Toilet 💩', value: `${stats.toilet.value.toFixed(0)}`, inline: true },
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