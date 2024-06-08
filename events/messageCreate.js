const { collection, setDoc, doc, getDocFromServer, getDocsFromServer } = require("firebase/firestore");
const db = require("@root/firebase");

module.exports = {
    name: "messageCreate",
    async execute(message) {
        if ((!message.content.startsWith(".")) || (message.content.length <= 3)) return; //special prefixes should start with "."
        
        let guildPrefix;
        try {
            const guildDocRef = doc(db, "guilds", message.guildId);
            const guildDocSnap = await getDocFromServer(guildDocRef);
            guildPrefix = guildDocSnap.data().prefix;
        } catch (error) {
            console.error("Error occurred:" + error);
        }
        const prefix = guildPrefix ?? ".p";

        if (!message.content.startsWith(prefix + " ")) return;

        console.log("Success!");
    }
}