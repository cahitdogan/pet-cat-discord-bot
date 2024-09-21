const { doc, getDoc } = require("firebase/firestore/lite");
const { db } = require("../firebase.js");
const { petStatus } = require("../prefix-commands/pet-status.js");


module.exports = {
    name: "messageCreate",
    async execute(message) {
        if ((!message.content.startsWith(".")) || (message.content.length <= 5)) return; //Buradaki tersini almanın detaylarını öğren ve bu condition'ı genel olarak düşün
        
        const userDocRef = doc(db, "users", message.author.id);
        const guildDocRef = doc(db, "guilds", message.guildId);

        let guildPrefix;
        try {
            const guildDocSnap = await getDoc(guildDocRef);
            guildPrefix = guildDocSnap.get("prefix");
        } catch (error) {
            console.error("Error occurred:" + error);
        }
        const prefix = guildPrefix ?? ".p";

        if (!message.content.startsWith(prefix + " ")) return;


        const endCharacter = Number(message.content.slice(-1));

        let command;
        let index = 0;
        if (isNaN(endCharacter)) {
            command = message.content + " ";
        } 
        else if ( (2 <= endCharacter) && (endCharacter <= 3) ) { 
            command = message.content.slice(0, -1);
            index = endCharacter - 1;
        }
        else {
            await message.reply("Pet number must be 2 or 3");
            return;
        }


        getDoc(userDocRef)
            .then(
                authorDocSnap => {
                    if (authorDocSnap.exists()) {
                        const pets = authorDocSnap.get("pets");
                        const pet = pets[index];

                        if (!pet) {
                            message.reply("You don't have a pet with this number.");
                            return;
                        }

                        if (pet.ownerState === false) {
                            const petDocRef = doc(db, "users", pet.ownerID, "pets", pet.petID);
                            commandHandler(petDocRef);
                        } else if (pet.ownerState === true) {
                            const petDocRef = doc(userDocRef, "pets", pet.petID);
                            commandHandler(petDocRef);
                        }
                    }
                    else { message.reply("You must have a pet before you can use this command."); }
                }
            )
        
        async function commandHandler(petDocRef) {
            switch (command) {
                case `${prefix} pet `:
                    await petStatus(message, petDocRef);
                    break;
            
                default:
                    await message.reply("There is no such command. (You can have a maximum of 9 pets)");
                    break;
            }
        }
    }
}