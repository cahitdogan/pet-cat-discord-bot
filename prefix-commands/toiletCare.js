const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async toiletCare(message, petDocRef) {
        const toilet = await timeDependentDecrease("toilet", petDocRef);
        let increasedToiletValue = toilet.value + 25;
        if (increasedToiletValue > 100) increasedToiletValue = 100;
        await updateDoc(petDocRef, { "stats.toilet.value": increasedToiletValue, "stats.toilet.timestamp": Date.now() });

        if (increasedToiletValue > 50) {
            const petDocSnap = await getDoc(petDocRef);
            if (toilet.value <= 50) {
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
                await updateDoc(petDocRef, { 
                    statsGreaterThan50Counter: ++statsGreaterThan50Counter,
                    "stats.toilet.isLessThan50": false
                });

                if (statsGreaterThan50Counter === 6) {
                    await updateDoc(petDocRef, { allStatsGreaterThan50Timestamp: Date.now() });
                }
            }

            const whenWillReach50Value = await whenWillReach50("toilet", petDocRef);
            await updateDoc(petDocRef, { 
                "stats.toilet.isFirstTimeLessThan50": true, 
                "stats.toilet.whenWillReach50": whenWillReach50Value
            });

        }

        await message.reply(`Success! Toilet status value: ${increasedToiletValue.toFixed(0)}`);
    }
}