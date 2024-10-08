const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async sleepCare(message, petDocRef) {
        const sleep = await timeDependentDecrease("sleep", petDocRef);
        let increasedSleepValue = sleep.value + 25;
        if (increasedSleepValue > 100) increasedSleepValue = 100;
        await updateDoc(petDocRef, { "stats.sleep.value": increasedSleepValue, "stats.sleep.timestamp": Date.now() });

        if (increasedSleepValue > 50) {
            const petDocSnap = await getDoc(petDocRef);
            if (sleep.value <= 50) {
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
                await updateDoc(petDocRef, { 
                    statsGreaterThan50Counter: ++statsGreaterThan50Counter,
                    "stats.sleep.isLessThan50": false
                });

                if (statsGreaterThan50Counter === 6) {
                    await updateDoc(petDocRef, { allStatsGreaterThan50Timestamp: Date.now() });
                }
            }

            const whenWillReach50Value = await whenWillReach50("sleep", petDocRef);
            await updateDoc(petDocRef, { 
                "stats.sleep.isFirstTimeLessThan50": true, 
                "stats.sleep.whenWillReach50": whenWillReach50Value
            });

        }

        await message.reply(`Success! sleep status value: ${increasedSleepValue.toFixed(0)}`);
    }
}