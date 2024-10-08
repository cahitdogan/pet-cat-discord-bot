const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async playCare(message, petDocRef) {
        const play = await timeDependentDecrease("play", petDocRef);
        let increasedPlayValue = play.value + 25;
        if (increasedPlayValue > 100) increasedPlayValue = 100;
        await updateDoc(petDocRef, { "stats.play.value": increasedPlayValue, "stats.play.timestamp": Date.now() });

        if (increasedPlayValue > 50) {
            const petDocSnap = await getDoc(petDocRef);
            if (play.value <= 50) {
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
                await updateDoc(petDocRef, { 
                    statsGreaterThan50Counter: ++statsGreaterThan50Counter,
                    "stats.play.isLessThan50": false
                });

                if (statsGreaterThan50Counter === 6) {
                    await updateDoc(petDocRef, { allStatsGreaterThan50Timestamp: Date.now() });
                }
            }

            const whenWillReach50Value = await whenWillReach50("play", petDocRef);
            await updateDoc(petDocRef, { 
                "stats.play.isFirstTimeLessThan50": true, 
                "stats.play.whenWillReach50": whenWillReach50Value
            });

        }

        await message.reply(`Success! Play status value: ${increasedPlayValue.toFixed(0)}`);
    }
}