const { SlashCommandBuilder } = require("discord.js");
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
            const inviterUserUsername = interaction.user.username;
            const invitedUserID = interaction.options.getUser("user").id;

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

            const pet = inviterUserPets[0];

            if (pet.ownerState === false) {
                await interaction.reply(`**<@${inviterUserID}>** | Only the real owner of the pet can invite a user to become a partner.`);
                return;
            }

            if (pet.partners[0] === invitedUserID || pet.partners[1] === invitedUserID) {
                await interaction.reply(`**<@${invitedUserID}>** is already a partner.`);
                return;
            }
            
            if (pet.partners.length === 2) {
                await interaction.reply(`**<@${inviterUserID}>** | You cannot have more than 2 partners.`);
                return;
            }
            
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
                else false;
            }

            const collector = inviteMessage.createReactionCollector({ filter: collectorFilter, time: 300_000, max: 1 });

            collector.on('collect', (reaction, user) => {
            });

            collector.on('end', async (collected) => {
                if (decision) {
                        const invitedUserDoc = doc(db, "users", invitedUserID);
                        let invitedUserSnap = await getDoc(invitedUserDoc);

                        async function buildPartnership(invitedUserPets) {
                            inviterUserPets[0].partners.push(invitedUserID);
                            await updateDoc(inviterUserDoc, { pets: inviterUserPets });

                            invitedUserPets.push({ petID:  pet.petID, petName: pet.petName, ownerState: false, ownerID: inviterUserID});
                            await updateDoc(invitedUserDoc, { pets: invitedUserPets });

                            await interaction.followUp("Invitation **accepted**. Please check your pet list.");
                        }

                        if (invitedUserSnap.exists()) {
                            let invitedUserPets = invitedUserSnap.get("pets");

                            if (invitedUserPets.length === 3) {
                                await interaction.followUp(`**<@${invitedUserID}>**, You cannot have more than 3 pets.`);
                                return;
                            }

                            buildPartnership(invitedUserPets);
                        } else {
                            await setDoc(invitedUserDoc, { coins: 0, pets: [] });
                            let invitedUserSnap = await getDoc(invitedUserDoc);
                            let invitedUserPets = invitedUserSnap.get("pets");
                            buildPartnership(invitedUserPets);
                        }
                } else {
                    await interaction.followUp("The invitation was **declined**.");
                }
            });
        }
    }
}