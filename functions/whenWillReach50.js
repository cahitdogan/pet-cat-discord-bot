const { getDoc } = require("firebase/firestore/lite");

module.exports = {
    async whenWillReach50(statName, petDocRef, isFirstTime, timestamp) {
        const statCoefficients = {
            "water": 0.000000714285714,
            "sleep": 0.000000578703704,
            "food": 0.0000005,
            "toilet": 0.0000005,
            "play": 0.0000005,
            "shower": 0.00005
        }

        const coefficient = statCoefficients[statName];

        const petDocSnap = await getDoc(petDocRef);
        const lastValue = isFirstTime ? 100 : petDocSnap.get(`stats.${statName}.value`);
        const lastTimestamp = isFirstTime ? timestamp : petDocSnap.get(`stats.${statName}.timestamp`);

        // as math equation    --->    50 = lastValue - (reachTime - lastTimestamp) * coefficient
        const reachTime = (lastValue - 50) / coefficient + lastTimestamp;
        return reachTime;
    }
}