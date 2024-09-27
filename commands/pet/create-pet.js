const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { setDoc, doc, getDoc, updateDoc } = require("firebase/firestore/lite");
const { db } = require("../../firebase.js");
const { whenWillReach50 } = require("../../functions/whenWillReach50.js");

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
        const userID = interaction.user.id;
        const userName = interaction.user.username;
        const petName = interaction.options.getString("pet-name");
        const userDocRef = doc(db, "users", userID);
        const petID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        const petDocRef = doc(userDocRef, "pets", petID);

        try {
            const userDocSnap = await getDoc(userDocRef);
            const petsArr = userDocSnap.get("pets");

            if (petsArr.length > 2) {
                await interaction.reply("You cannot have more than 3 pets.");
                return;
            }

            if (petsArr.length === 0) {
                petsArr[0] = { petID: petID, petName: petName, ownerState: true, partners: [] };

                try {
                    await updateDoc(userDocRef, { pets: [ petsArr[0] ] } );
                    await createPet();
                    await showPet();
                    return;
                } catch (error) {
                    console.error(error);
                    return;
                }
            }

            if (petsArr[0].ownerState === true) {
                await interaction.reply("You already have your own pet.");
                return;
            } else if (petsArr[0].ownerState === false){
                petsArr.unshift({ petID: petID, petName: petName, ownerState: true, partners: [] });
                try {
                    await updateDoc(userDocRef, {pets: petsArr});
                    await createPet();
                    await showPet();
                    return;
                } catch (error) {
                    console.error(error);
                    return;
                }
            }
        } catch (error) {
            await createPet(true);
            await showPet();
            return;
        }

        async function createPet(firstTime) {
            if (firstTime) {
                try {
                    await setDoc(userDocRef, {
                        coins: 0,
                        pets: [
                            { petID: petID, petName: petName, ownerState: true, partners: [] },
                        ]
                    })
                } catch (error) {
                    console.error(error);
                }
            }

            try {
                const now = Date.now();
                const statsStrArr = ["water", "food", "sleep", "play", "shower", "toilet"];
                const results = await Promise.all(statsStrArr.map(statStr => whenWillReach50(statStr, petDocRef, now, true)));

                const whenWillReach50Arr = {};
                for (let i = 0; i < statsStrArr.length; i++) {
                    const statStr = statsStrArr[i];
                    whenWillReach50Arr[statStr] = results[i];
                }

                await setDoc(petDocRef, {
                    ownerName: userName,
                    petName: petName,
                    level: 0,
                    exp: 0,
                    health: 100,
                    allStatsGreaterThan50: true,
                    stats: {
                        water: {value: 100, timestamp: now, whenWillReach50: whenWillReach50Arr.water, isFirstTime: true},
                        food: {value: 100, timestamp: now, whenWillReach50: whenWillReach50Arr.food, isFirstTime: true},
                        sleep: {value: 100, timestamp: now, whenWillReach50: whenWillReach50Arr.sleep, isFirstTime: true},
                        play: {value: 100, timestamp: now, whenWillReach50: whenWillReach50Arr.play, isFirstTime: true},
                        shower: {value: 100, timestamp: now, whenWillReach50: whenWillReach50Arr.shower, isFirstTime: true},
                        toilet: {value: 100, timestamp: now, whenWillReach50: whenWillReach50Arr.toilet, isFirstTime: true},
                    },
                    accessories: {}
                });
            } catch (error) {
                await interaction.reply("Error creating pet!");
                return;
            }
    
            await interaction.reply(`Congratulations **${userName}** ! Your pet has been created. `);
        }
        
        async function showPet() {
            try {
                const petDocSnap = await getDoc(petDocRef);
                const petData = petDocSnap.data();
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
                        { name: '\u200B', value: `❤️ **Health:** ${health}`, inline: true }
                    )
                    .setFooter({text: `${userName}`})
                    .setTimestamp();
    
                await interaction.channel.send({ embeds: [petEmbed] });
            } catch (error) {
                console.error(error);
                await interaction.channel.send("An error occurred while viewing your pet.");
            }
        }        
    }
}