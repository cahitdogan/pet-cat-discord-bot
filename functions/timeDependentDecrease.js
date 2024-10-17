const { getDoc, updateDoc } = require("firebase/firestore/lite");
const { healthDecrease } = require("./healthDecrease");

module.exports = {
    async timeDependentDecrease(statName, petDocRef) {
        const statCoefficients = {
            "water": 0.000714285714,
            "sleep": 0.000414285714,
            "food": 0.000514285714,
            "toilet": 0.000614285714,
            "play": 0.000814285714,
            "shower": 0.000914285714
        }
        const coefficient = statCoefficients[statName];

        // as math equation    --->    new value = last value - subtraction value
        // subtraction value = (new timestamp - last timestamp) * coefficient
        const petDocSnap = await getDoc(petDocRef);
        let statObj = petDocSnap.get(`stats.${statName}`);
        const newTimestamp = Date.now();
        const lastTimestamp = statObj.timestamp;
        const subtractionValue = (newTimestamp - lastTimestamp) * coefficient;
        statObj.value = (statObj.value - subtractionValue) >= 0 ? (statObj.value - subtractionValue) : 0;
        statObj.timestamp = newTimestamp;

        let statsGreaterThan50Counter = petDocSnap.get("statsGreaterThan50Counter");
        const isLessThan50 = petDocSnap.get(`stats.${statName}.isLessThan50`);
        const updateObj = {};
        if (statObj.value <= 50) {
            await healthDecrease(newTimestamp, lastTimestamp, petDocRef, statName, coefficient);

            if (!isLessThan50) {
                updateObj[`stats.${statName}.isLessThan50`] = true;
                updateObj.statsGreaterThan50Counter = --statsGreaterThan50Counter;      
            }
        }

        updateObj[`stats.${statName}.value`] = statObj.value;
        updateObj[`stats.${statName}.timestamp`] = statObj.timestamp;

        await updateDoc(petDocRef, updateObj);

        return statObj;
    }
}