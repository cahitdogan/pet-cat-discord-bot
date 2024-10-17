const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async waterCare(message, petDocRef) {
        const water = await timeDependentDecrease("water", petDocRef);
        let increasedWaterValue = water.value + 25;
        if (increasedWaterValue > 100) increasedWaterValue = 100;
        
        const updateObj = {};
        updateObj[`stats.water.value`] = increasedWaterValue;
        updateObj[`stats.water.timestamp`] = Date.now();

        if (increasedWaterValue > 50) {
            if (water.value <= 50) {
                updateObj["stats.water.isFirstTimeLessThan50"] = true;
                updateObj.statsGreaterThan50Counter = ++statsGreaterThan50Counter;
                updateObj[`stats.water.isLessThan50`] = false;

                const petDocSnap = await getDoc(petDocRef);
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");

                if (statsGreaterThan50Counter === 6) {
                    updateObj.allStatsGreaterThan50Timestamp = Date.now()
                }
            }

            const whenWillReach50Value = await whenWillReach50("water", petDocRef);
            updateObj["stats.water.whenWillReach50"] = whenWillReach50Value;
        }

        await updateDoc(petDocRef, updateObj);
        await message.reply(`Success! Water status value: ${increasedWaterValue.toFixed(0)}`);
    }
}