const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async foodCare(message, petDocRef) {
        const food = await timeDependentDecrease("food", petDocRef);
        let increasedFoodValue = food.value + 25;
        if (increasedFoodValue > 100) increasedFoodValue = 100;
        await updateDoc(petDocRef, { "stats.food.value": increasedFoodValue, "stats.food.timestamp": Date.now() });

        if (increasedFoodValue > 50) {
            const petDocSnap = await getDoc(petDocRef);
            if (food.value <= 50) {
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
                await updateDoc(petDocRef, { 
                    statsGreaterThan50Counter: ++statsGreaterThan50Counter,
                    "stats.food.isLessThan50": false
                });

                if (statsGreaterThan50Counter === 6) {
                    await updateDoc(petDocRef, { allStatsGreaterThan50Timestamp: Date.now() });
                }
            }

            const whenWillReach50Value = await whenWillReach50("food", petDocRef);
            await updateDoc(petDocRef, { 
                "stats.food.isFirstTimeLessThan50": true, 
                "stats.food.whenWillReach50": whenWillReach50Value
            });

        }

        await message.reply(`Success! Food status value: ${increasedFoodValue.toFixed(0)}`);
    }
}