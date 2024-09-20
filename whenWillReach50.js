const { setDoc, doc, getDoc, updateDoc } = require("firebase/firestore/lite");

export default function whenWillReach50(stat, userId) {
    const statCoefficients = {
        "water": 0.6,
        "sleep": 0.5,
        "food": 0.5,
        "toilet": 0.5,
        "play": 0.5,
        "shower": 0.5
    }

    const coefficient = statCoefficients[stat];
    const timestamp = Date.now();
    const userDocRef = doc(db, "users", userId);
    const userDocSnap

    // as math equation    --->    50 = lastValue - (reachTime - timestamp) * coefficient
    const reachTime = (lastValue - 50) / coefficient + timestamp;
    return reachTime;
}