const { getDoc } = require("firebase/firestore/lite");

module.exports = {
    async whenWillReach50(statName, petDocRef) {
        const statCoefficients = {
            "water": 0.6,
            "sleep": 0.5,
            "food": 0.5,
            "toilet": 0.5,
            "play": 0.5,
            "shower": 0.5
        }

        const coefficient = statCoefficients[statName];

        const petDocSnap = await getDoc(petDocRef);
        const lastValue = petDocSnap.get(`stats.${statName}.value`);
        const lastTimestamp = petDocSnap.get(`stats.${statName}.timestamp`);

        // as math equation    --->    50 = lastValue - (reachTime - lastTimestamp) * coefficient
        const reachTime = (lastValue - 50) / coefficient + lastTimestamp;
        return reachTime;
    }
}