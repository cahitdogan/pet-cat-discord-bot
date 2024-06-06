const { SlashCommandBuilder } = require("discord.js");
const { collection, setDoc, doc } = require("firebase/firestore");
const db = require("../../firebase");

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName("pet-oluştur")
        .setDescription("Yeni bir pet yaratır.")
        .addStringOption(option => 
            option.setName("pet-adı")
                .setMaxLength(20)
                .setDescription("Petinize bir ad verin.")
                .setRequired(true)),

    async execute(interaction) {
        const petName = interaction.options.getString("pet-adı");
        const userID = interaction.user.id;
        petCreator(userID, petName);
        await interaction.reply("Pet oluşturuldu.");
    }
}

async function petCreator(userID, petName) {
    try {
        const userRef = doc(collection(db, "users"), userID);
        const petCollectionRef = collection(userRef, "pets");
        const petRef = doc(petCollectionRef, petName);

        await setDoc(petRef, {
            level: 0,
            exp: 0,
            coin: 0,
            stats: {
                water: 100,
                food: 100,
                sleep: 100,
                play: 100,
                shower: 100,
                toilet: 100
            },
            accessories: {}
        });

        console.log('Pet başarıyla oluşturuldu!');
    } catch (error) {
        console.error('Hata oluştu:', error);
    }
}