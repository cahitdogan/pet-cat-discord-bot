const { doc, getDoc } = require("firebase/firestore/lite");
const { db } = require("@root/firebase.js");


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
        else if (endCharacter >= 2) { 
            command = message.content.slice(0, -1);
            index = endCharacter - 1;
        }
        else {
            await message.reply("Number must be 2 or greater than 2 (max 9)");
            return;
        }

        let petID;
        getDoc(userDocRef)
            .then(
                result => { 
                    const authorDocSnap = result;
                    const pets = authorDocSnap.get("pets");
                    const pet = pets[index];
                    if (!pet) {
                        message.reply("You don't have a pet with this number.");
                        return;
                    }
                    petID = pet.petID;
                    petOwnerState = pet.ownerState;
                    commandHandler();
                 },
                 () => {message.reply("You must have a pet before you can use this command.");}
            )
        
        async function commandHandler() {
            switch (command) {
                case `${prefix} pet `:
                    await message.reply("Success!");
                    break;
            
                default:
                    await message.reply("There is no such command. (You can have a maximum of 9 pets)");
                    break;
            }
        }
    }
}