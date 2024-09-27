const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { lessThan50 } = require("./lessThan50");

module.exports = {
    async timeDependentDecrease(statName, petDocRef) {
        const statCoefficients = {
            "water": 0.000000714285714,
            "sleep": 0.000000578703704,
            "food": 0.0000005,
            "toilet": 0.0000005,
            "play": 0.0000005,
            "shower": 0.00005
        }

        // as math equation    --->    new value = last value - subtraction value
        // subtraction value = (new timestamp - last timestamp) * coefficient

        const coefficient = statCoefficients[statName];

        let petDocSnap;
        try {
            petDocSnap = await getDoc(petDocRef);
        } catch (error) {
            console.error(error);
            return;
        }

        let statObj = petDocSnap.get(`stats.${statName}`);
        const newTimestamp = Date.now();
        const lastTimestamp = statObj.timestamp;
        const subtractionValue = (newTimestamp - lastTimestamp) * coefficient;

        statObj.value = (statObj.value - subtractionValue) >= 0 ? (statObj.value - subtractionValue) : 0;
        statObj.timestamp = newTimestamp;

        if (statObj.value <= 50) {
            await lessThan50(newTimestamp, lastTimestamp, petDocRef, statName, coefficient)
        } else {
            
        }

        await updateDoc(petDocRef, { [`stats.${statName}.value`]: statObj.value });
        await updateDoc(petDocRef, { [`stats.${statName}.timestamp`]: statObj.timestamp });

        return statObj;
    }
}