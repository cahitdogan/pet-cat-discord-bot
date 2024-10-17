const { getDoc } = require("firebase/firestore/lite");

module.exports = {
    async whenWillReach50(statName, petDocRef, timestamp, firstTimeCalculation) {
        const statCoefficients = {
            "water": 0.000714285714,
            "sleep": 0.000414285714,
            "food": 0.000514285714,
            "toilet": 0.000614285714,
            "play": 0.000814285714,
            "shower": 0.000914285714
        }
        const coefficient = statCoefficients[statName];

        const petDocSnap = await getDoc(petDocRef);
        const lastValue = firstTimeCalculation ? 100 : petDocSnap.get(`stats.${statName}.value`);
        const lastTimestamp = firstTimeCalculation ? timestamp : petDocSnap.get(`stats.${statName}.timestamp`);
        // as math equation    --->    50 = lastValue - (reachTime - Date.time()) * coefficient
        const reachTime = (lastValue - 50) / coefficient + lastTimestamp;
        
        const firstWhenWillReach50Value = petDocSnap.get("firstWhenWillReach50Value");
        if (reachTime < firstWhenWillReach50Value) {
            await updateDoc(petDocRef, { firstWhenWillReach50Value: reachTime });
        }

        return reachTime;
    }
}