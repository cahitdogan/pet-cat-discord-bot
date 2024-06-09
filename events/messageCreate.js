const { doc, getDocFromServer } = require("firebase/firestore");
const { db, guildsCollectionRef, usersCollectionRef } = require("@root/firebase.js");
const { pet } = require("@root/prefix-commands/pet.js");


module.exports = {
    name: "messageCreate",
    async execute(message) {
        if ((!message.content.startsWith(".")) || (message.content.length <= 3)) return; //special prefixes should start with "."
        
        let guildPrefix;
        try {
            const guildDocRef = doc(guildsCollectionRef, message.guildId);
            const guildDocSnap = await getDocFromServer(guildDocRef);
            guildPrefix = guildDocSnap.data().prefix;
        } catch (error) {
            console.error("Error occurred:" + error);
        }
        const prefix = guildPrefix ?? ".p";

        if (!message.content.startsWith(prefix + " ")) return;


        const endCharacter = Number(message.content.slice(-1));
        
        console.log(endCharacter);

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

        const authorDocRef = doc(usersCollectionRef, message.author.id);
        const authorDocSnap = await getDocFromServer(authorDocRef);
        const authorData = authorDocSnap.data();
        const pet = authorData.pets[index];

        switch (command) {
            case `${prefix} pet `:
                await message.reply("Başarılı");
                break;
        
            default:
                await message.reply("There is no such command. (You can have a maximum of 9 pets)");
                break;
        }
    }
}