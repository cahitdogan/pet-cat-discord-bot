const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { setDoc, doc, getDoc, updateDoc } = require("firebase/firestore/lite");
const { db } = require("../../firebase.js");

module.exports = {
    cooldown: 15,
    data: new SlashCommandBuilder()
        .setName("partnership")
        .setDescription("Partnership options")
        .addSubcommand(subcommand =>
            subcommand
                .setName('invite')
                .setDescription('Invite a user to become a partner in your pet')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user you want as your partner')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-partner')
                .setDescription('Remove a partner of your pet'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leave-partnership')
                .setDescription('Leave a partnership')),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'invite') {
            const inviterUserID = interaction.user.id;
            const invitedUserID = interaction.options.getUser("user").id;
            const invitedUsername = interaction.options.getUser("user").username;

            if (inviterUserID === invitedUserID) {
                await interaction.reply(`**<@${inviterUserID}>** | You cannot invite yourself into partnership`);
                return;
            } else if (interaction.options.getUser("user").bot === true || interaction.options.getUser("user").system === true) {
                await interaction.reply(`**<@${inviterUserID}>** | What are you planning for by inviting a bot or system to partner?`);
                return;
            }

            const inviterUserDoc = doc(db, "users", inviterUserID);
            const inviterUserSnap = await getDoc(inviterUserDoc);

            if (!inviterUserSnap.exists()) {
                await interaction.reply(`**<@${inviterUserID}>** | First you have to have a pet.`);
                return;
            }

            const inviterUserPets = inviterUserSnap.get("pets");

            if (inviterUserPets.length === 0) {
                await interaction.reply(`**<@${inviterUserID}>** | First you have to have a pet.`);
                return;
            }

            // The pet we own cannot be in any index other than index 0
            // So it is certain that the invitation is for index 0
            // Therefore, if the inviter has a pet at index 0 but is not the real owner, the invitation is invalid
            const pet = inviterUserPets[0];

            if (pet.ownerState === false) {
                await interaction.reply(`**<@${inviterUserID}>** | Only the real owner of the pet can invite a user to become a partner.`);
                return;
            }

            // A pet can have a maximum of 2 partners
            if (pet.partners.length === 1) {
                if (pet.partners[0].partnerID === invitedUserID) {
                    await interaction.reply(`**<@${invitedUserID}>** is already a partner.`);
                    return;
                }
            } else if (pet.partners.length === 2) {
                await interaction.reply(`**<@${inviterUserID}>** | You cannot have more than 2 partners.`);
                return;
            }

            const inviterUserUsername = interaction.user.username;
            const inviteMessage = await interaction.reply({ content: `Hey **<@${invitedUserID}>**! | **${inviterUserUsername}** invited you to be a partner in its pet. Do you agree to be partners? You have **5** minutes to decide.`, fetchReply: true });
            await inviteMessage.react("✅");
            await inviteMessage.react("⛔");

            let decision;
            const collectorFilter = (reaction, user) => {
                if (reaction.emoji.name === "✅" && user.id === invitedUserID) {
                    decision = true;
                    return true;
                }
                else if (reaction.emoji.name === "⛔" && user.id === invitedUserID) {
                    decision = false;
                    return true;
                }
                else return false;
            }

            const collector = inviteMessage.createReactionCollector({ filter: collectorFilter, time: 300_000, max: 1 });

            collector.on('collect', (reaction, user) => {
            });

            collector.on('end', async (collected) => {
                if (decision) {
                    const invitedUserDoc = doc(db, "users", invitedUserID);
                    let invitedUserSnap = await getDoc(invitedUserDoc);

                    async function buildPartnership(invitedUserPets) {
                        inviterUserPets[0].partners.push({ partnerID: invitedUserID, partnerUsername: invitedUsername });
                        await updateDoc(inviterUserDoc, { pets: inviterUserPets });

                        invitedUserPets.push({ petID: pet.petID, petName: pet.petName, ownerState: false, ownerID: inviterUserID });
                        await updateDoc(invitedUserDoc, { pets: invitedUserPets });

                        await interaction.followUp("Invitation **accepted**. Please check your pet list.");
                    }

                    if (invitedUserSnap.exists()) {
                        let invitedUserPets = invitedUserSnap.get("pets");

                        if (invitedUserPets.length >= 3) {
                            await interaction.followUp(`**<@${invitedUserID}>**, You cannot have more than 3 pets.`);
                            return;
                        }

                        buildPartnership(invitedUserPets);
                    } else {
                        try {
                            await setDoc(invitedUserDoc, { coins: 0, pets: [] })
                        } catch {
                            return;
                        }

                        buildPartnership([]);
                    }
                } else {
                    await interaction.followUp("The invitation was **declined**.");
                }
            });
        }

        // Kullanıcı komutu kullandıktan sonra eğer varsa partnerlerinin bir listesi gönderilir.
        // Listenin altına emojilerle partner sayısı kadar emoji eklenir (1 - 2)
        // Kullanıcı emojilerden birisine tıkladığında ilgili partner silinir
        if (interaction.options.getSubcommand() === 'remove-partner') {
            const userId = interaction.user.id;
            const userName = interaction.user.username;
            const userDocRef = doc(db, "users", userId);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await interaction.reply("You don't have a pet!");
                return;
            }

            const pets = userDocSnap.get("pets");

            if (pets.length === 0) {
                await interaction.reply("You don't have a pet!");
                return;
            }

            if (!pets[0].ownerState) {
                await interaction.reply("You don't have your own pet!");
                return;
            }

            const partners = pets[0].partners;
            let partnersListString;

            if (partners.length === 0) {
                await interaction.reply("You don't have a partner!");
                return;
            } else if (partners.length === 1) {
                partnersListString = `Which partner do you want to remove? \n **1. **${partners[0].partnerUsername}`;
            } else if (partners.length === 2) {
                partnersListString = `Which partner do you want to remove? \n **1. **${partners[0].partnerUsername} \n **2. **${partners[1].partnerUsername}`;
            }

            const message = await interaction.reply({ content: `**${userName}'s** Partners \n ${partnersListString}`, fetchReply: true });
            
            if (partners.length === 1) {
              await message.react("1️⃣");
            } else if (partners.length === 2) {
              await message.react("1️⃣");
              await message.react("2️⃣");
            }
            
            let decision;
            const collectorFilter = (reaction, user) => {
              if (reaction.emoji.name === "1️⃣" && user.id === userId) {
                decision = 1;
                return true;
              }
              else if (reaction.emoji.name === "2️⃣" && user.id === userId) {
                decision = 2;
                return true;
              }
              else return false;
            }
            
            const collector = message.createReactionCollector({ filter: collectorFilter, time: 300_000, max: 1 });

            collector.on('collect', (reaction, user) => {
            });

            collector.on('end', async (collected) => {
              if (decision === 1) {
                const partnerId = partners[0].partnerID;
                const petId = pets[0].petID;
                
                pets[0].partners.shift();
                await updateDoc(userDocRef, { pets: pets });
                
                const partnerDocRef = doc(db, "users", partnerId);
                const partnerDocSnap = await getDoc(partnerDocRef);
                const partnerPets = partnerDocSnap.get('pets');

                for (let i = 0; i < partnerPets.length; i++) {
                    const pet = partnerPets[i];
                    
                    if (pet.petID === petId) {
                        partnerPets.splice(i, i + 1);
                        await updateDoc(partnerDocRef, { pets: partnerPets });
                        await interaction.followUp("Partner removed.");
                    }
                }
              }
            })
        }

        if (interaction.options.getSubcommand() === 'leave-partnership') {
            const userDocRef = doc(db, "users", interaction.user.id);
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
                await interaction.reply(`**<@${interaction.user.id}>** | You're not the partner of any pet.`);
                return;
            }

            const pets = userDocSnap.get("pets");

            if (pets.length === 0) {
                await interaction.reply(`**<@${interaction.user.id}>** | You're not the partner of any pet.`);
                return;
            }

            let replyString = "**For which pet do you want to leave the partnership?** \n";
            let counter = 1;

            for (let i = 0; i < pets.length; i++) {
                const pet = pets[i];

                if (pet.ownerState === false) {
                    replyString += `**${counter}.** ${pet.petName} \n`;
                    counter++;
                }
            }

            let message;
            if (counter > 1) {
                message = await interaction.reply({ content: replyString, fetchReply: true });
            }
            else if (counter === 1) {
                message = await interaction.reply({ content: "You're not the partner of any pet.", fetchReply: true });
            }

            if (counter === 2) {
                await message.react("1️⃣");
            } else if (counter === 3) {
                await message.react("1️⃣");
                await message.react("2️⃣");
            }

            let decision;
            const collectorFilter = (reaction, user) => {
              if (reaction.emoji.name === "1️⃣" && user.id === interaction.user.id) {
                decision = 1;
                return true;
              }
              else if (reaction.emoji.name === "2️⃣" && user.id === interaction.user.id) {
                decision = 2;
                return true;
              }
              else return false;
            }

            const collector = message.createReactionCollector({ filter: collectorFilter, time: 300_000, max: 1 });

            collector.on('collect', (reaction, user) => {
            });

            collector.on('end', async (collected) => {
                if (decision === 1) {
                    if (pets[0].ownerState === false) {
                        const ownerId = pets[0].ownerID;
                        const ownerDocRef = doc(db, "users", ownerId);
                        const ownerDocSnap = await getDoc(ownerDocRef);
                        const ownerPets = ownerDocSnap.get("pets")
                        const ownerPartners = ownerPets[0].partners;

                        pets.splice(0, 1);
                        await updateDoc(userDocRef, { pets: pets });

                        for (let i = 0; i < ownerPartners.length; i++) {
                            const ownerPartner = ownerPartners[i];
                            
                            if (ownerPartner.partnerID === interaction.user.id) {
                                ownerPets[0].partners.splice(i, i + 1);
                                await updateDoc(ownerDocRef, { pets: ownerPets })
                                break;
                            }
                        }
                    } else {
                        const ownerId = pets[1].ownerID;
                        const ownerDocRef = doc(db, "users", ownerId);
                        const ownerDocSnap = await getDoc(ownerDocRef);
                        const ownerPets = ownerDocSnap.get("pets")
                        const ownerPartners = ownerPets[0].partners;

                        pets.splice(1, 2);
                        await updateDoc(userDocRef, { pets: pets });

                        for (let i = 0; i < ownerPartners.length; i++) {
                            const ownerPartner = ownerPartners[i];
                            
                            if (ownerPartner.partnerID === interaction.user.id) {
                                ownerPets[0].partners.splice(i, i + 1);
                                await updateDoc(ownerDocRef, { pets: ownerPets })
                                break;
                            }
                        }
                    }
                } else if (decision === 2) {
                    if (pets[0].ownerState === false) {
                        const ownerId = pets[1].ownerID;
                        const ownerDocRef = doc(db, "users", ownerId);
                        const ownerDocSnap = await getDoc(ownerDocRef);
                        const ownerPets = ownerDocSnap.get("pets")
                        const ownerPartners = ownerPets[0].partners;

                        pets.splice(1, 2);
                        await updateDoc(userDocRef, { pets: pets });

                        for (let i = 0; i < ownerPartners.length; i++) {
                            const ownerPartner = ownerPartners[i];
                            
                            if (ownerPartner.partnerID === interaction.user.id) {
                                ownerPets[0].partners.splice(i, i + 1);
                                await updateDoc(ownerDocRef, { pets: ownerPets })
                                break;
                            }
                        }
                    } else {
                        const ownerId = pets[2].ownerID;
                        const ownerDocRef = doc(db, "users", ownerId);
                        const ownerDocSnap = await getDoc(ownerDocRef);
                        const ownerPets = ownerDocSnap.get("pets")
                        const ownerPartners = ownerPets[0].partners;

                        pets.splice(2, 3);
                        await updateDoc(userDocRef, { pets: pets });

                        for (let i = 0; i < ownerPartners.length; i++) {
                            const ownerPartner = ownerPartners[i];
                            
                            if (ownerPartner.partnerID === interaction.user.id) {
                                ownerPets[0].partners.splice(i, i + 1);
                                await updateDoc(ownerDocRef, { pets: ownerPets })
                                break;
                            }
                        }
                    }
                }

                interaction.followUp("You've successfully left the partnership.")
            })
        }
    }
}