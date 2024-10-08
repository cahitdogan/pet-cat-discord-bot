const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { timeDependentDecrease } = require("../functions/timeDependentDecrease");
const { whenWillReach50 } = require("../functions/whenWillReach50");

module.exports = {
    async showerCare(message, petDocRef) {
        const shower = await timeDependentDecrease("shower", petDocRef);
        let increasedShowerValue = shower.value + 25;
        if (increasedShowerValue > 100) increasedShowerValue = 100;
        await updateDoc(petDocRef, { "stats.shower.value": increasedShowerValue, "stats.shower.timestamp": Date.now() });

        if (increasedShowerValue > 50) {
            const petDocSnap = await getDoc(petDocRef);
            if (shower.value <= 50) {
                let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
                await updateDoc(petDocRef, { 
                    statsGreaterThan50Counter: ++statsGreaterThan50Counter,
                    "stats.shower.isLessThan50": false
                });

                if (statsGreaterThan50Counter === 6) {
                    await updateDoc(petDocRef, { allStatsGreaterThan50Timestamp: Date.now() });
                }
            }

            const whenWillReach50Value = await whenWillReach50("shower", petDocRef);
            await updateDoc(petDocRef, { 
                "stats.shower.isFirstTimeLessThan50": true, 
                "stats.shower.whenWillReach50": whenWillReach50Value
            });

        }

        await message.reply(`Success! Shower status value: ${increasedShowerValue.toFixed(0)}`);
    }
}