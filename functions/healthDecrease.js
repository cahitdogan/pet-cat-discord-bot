const { getDoc, updateDoc } = require("firebase/firestore/lite");

module.exports = {
    async healthDecrease(newTimestamp, lastTimestamp, petDocRef, statName, coefficient) {
        const petDocSnap = await getDoc(petDocRef);
        let health = petDocSnap.get("health");
        const isFirstTimeLessThan50 = petDocSnap.get(`stats.${statName}.isFirstTimeLessThan50`);

        if (isFirstTimeLessThan50) {
            const whenWillReach50 = petDocSnap.get(`stats.${statName}.whenWillReach50`);
            const subtractionValue = (newTimestamp - whenWillReach50) * coefficient;
            health = health - subtractionValue;
            if (health < 0) health = 0;

            await updateDoc(petDocRef, {
                [`stats.${statName}.isFirstTimeLessThan50`]: false,
                health: health
            });
        } else {
            const subtractionValue = (newTimestamp - lastTimestamp) * coefficient;
            health = health - subtractionValue;
            if (health < 0) health = 0;

            await updateDoc(petDocRef, { health: health });
        }
    }
}