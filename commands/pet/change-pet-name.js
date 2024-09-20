const { SlashCommandBuilder } = require("discord.js");
const { doc, updateDoc, getDoc } = require("firebase/firestore/lite");
const { db } = require("../../firebase.js");

module.exports = {
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName("change-pet-name")
        .setDescription("Change your pet's name")
        .addStringOption(option => 
            option.setName("new-name")
                .setMaxLength(20)
                .setDescription("Pet's new name")
                .setRequired(true)),
    
    async execute(interaction) {
        const userDocRef = doc(db, "users", interaction.user.id);
        const newPetName = interaction.options.getString("new-name");

        try {
            const userDocSnap = await getDoc(userDocRef);
            const pets = userDocSnap.get("pets");

            if (pets[0]) {
                if (pets[0].ownerState === true) {
                    pets[0].petName = newPetName;
                    await updateDoc(userDocRef, { pets: pets });

                    const petDocRef = doc(userDocRef, "pets", pets[0].petID);
                    await updateDoc(petDocRef, {petName: newPetName});

                    const partner_0 = pets[0].partners[0];

                    if (partner_0) {
                        const partner_0_ID = pets[0].partners[0].petID;
                        const partner_0_DocRef = doc(db, "users", partner_0_ID);
                        const partner_0_DocSnap = await getDoc(partner_0_DocRef);
                        const partner_0_pets = partner_0_DocSnap.get("pets");

                        for (let i = 0; i < partner_0_pets.length; i++) {
                            if (partner_0_pets[i].petID === pets[0].petID) {
                                partner_0_pets[i].petName = newPetName;
                                await updateDoc(partner_0_DocRef, { pets: partner_0_pets });
                            } 
                        }

                        const partner_1_ID = pets[0].partners[1];

                        if (partner_1_ID) {
                            const partner_1_DocRef = doc(db, "users", partner_1_ID);
                            const partner_1_DocSnap = await getDoc(partner_1_DocRef);
                            const partner_1_pets = partner_1_DocSnap.get("pets");

                            for (let i = 0; i < partner_1_pets.length; i++) {
                                if (partner_0_pets[i].petID === pets[0].petID) {
                                    partner_0_pets[i].petName = newPetName;
                                    await updateDoc(partner_1_DocRef, { pets: partner_1_pets });
                                } 
                            }
                        }
                    }

                    await interaction.reply("Your pet's name has been successfully changed.");
                    return;
                } else if (pets[0].ownerState === false) {
                    await interaction.reply("You cannot change the name of a pet you are a partner in. You must be the pet's owner.");
                }
            } else {
                await interaction.reply("You must have a pet before you can use this command.");
            }
        } catch (error) {
            console.error(error);
            await interaction.reply("You must have a pet before you can use this command.");
        }
    }
}