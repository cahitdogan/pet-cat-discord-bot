const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async waterCare(message, petDocRef) {
        const water = await timeDependentDecrease("water", petDocRef);
        let increasedWaterValue = water.value + 25;
        if (increasedWaterValue > 100) increasedWaterValue = 100;
        await updateDoc(petDocRef, { "stats.water.value": increasedWaterValue, "stats.water.timestamp": Date.now() });

        if (increasedWaterValue > 50) {
            const petDocSnap = await getDoc(petDocRef);
            if (water.value <= 50) {
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
                await updateDoc(petDocRef, {
                    statsGreaterThan50Counter: ++statsGreaterThan50Counter,
                    "stats.water.isLessThan50": false
                });
                
                if (statsGreaterThan50Counter === 6) {
                    await updateDoc(petDocRef, { allStatsGreaterThan50Timestamp: Date.now() });
                }
            }

            const whenWillReach50Value = await whenWillReach50("water", petDocRef);
            await updateDoc(petDocRef, { 
                "stats.water.isFirstTimeLessThan50": true, 
                "stats.water.whenWillReach50": whenWillReach50Value
            });

        }

        await message.reply(`Success! water status value: ${increasedWaterValue.toFixed(0)}`);
    }
}