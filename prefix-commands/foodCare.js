const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async foodCare(message, petDocRef) {
        const food = await timeDependentDecrease("food", petDocRef);

        food.value = food.value + 25;
        if (food.value >= 100) food.value = 100;

        await updateDoc(petDocRef, { "stats.food.value": food.value, "stats.food.timestamp": Date.now() });

        if (food.value > 50) {
            await updateDoc(petDocRef, { "stats.food.isFirstTime": true });
            await whenWillReach50("food", petDocRef);
        }

        await message.reply(`Success! Food status value: ${food.value.toFixed(0)}`);
    }
}