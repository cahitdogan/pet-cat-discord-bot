const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async playCare(message, petDocRef) {
        const play = await timeDependentDecrease("play", petDocRef);
        let increasedPlayValue = play.value + 25;
        if (increasedPlayValue > 100) increasedPlayValue = 100;
        
        const updateObj = {};
        updateObj[`stats.play.value`] = increasedPlayValue;
        updateObj[`stats.play.timestamp`] = Date.now();

        if (increasedPlayValue > 50) {
            if (play.value <= 50) {
                updateObj["stats.play.isFirstTimeLessThan50"] = true;
                updateObj.statsGreaterThan50Counter = ++statsGreaterThan50Counter;
                updateObj[`stats.play.isLessThan50`] = false;

                const petDocSnap = await getDoc(petDocRef);
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");

                if (statsGreaterThan50Counter === 6) {
                    updateObj.allStatsGreaterThan50Timestamp = Date.now()
                }
            }

            const whenWillReach50Value = await whenWillReach50("play", petDocRef);
            updateObj["stats.play.whenWillReach50"] = whenWillReach50Value;
        }

        await updateDoc(petDocRef, updateObj);
        await message.reply(`Success! Play status value: ${increasedPlayValue.toFixed(0)}`);
    }
}