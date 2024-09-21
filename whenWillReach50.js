const { getDoc } = require("firebase/firestore/lite");

export default async function whenWillReach50(stat, petDocRef) {
    const statCoefficients = {
        "water": 0.6,
        "sleep": 0.5,
        "food": 0.5,
        "toilet": 0.5,
        "play": 0.5,
        "shower": 0.5
    }

    const coefficient = statCoefficients[stat];

    const petDocSnap = await getDoc(petDocRef);
    const lastValue = petDocSnap.get(`stats.${stat}.value`);
    const lastTimestamp = petDocSnap.get(`stats.${stat}.timestamp`);

    // as math equation    --->    50 = lastValue - (reachTime - lastTimestamp) * coefficient
    const reachTime = (lastValue - 50) / coefficient + lastTimestamp;
    return reachTime;
}