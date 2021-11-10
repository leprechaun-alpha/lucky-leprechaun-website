
const winnersDist = [1, 2, 3, 10, 50, 150]
const distributionSchedule = [1500, 1000, 500, 200, 65, 30]
let sum = 0;

for (let i = 0; i <winnersDist[winnersDist.length - 1]; i++){
    for (let j = 0; j < winnersDist.length; j++){
        if (i >= winnersDist[j]) {
            continue
        } else {
            sum += distributionSchedule[j]
            break
        }
    }
}

let expectedResult = 1500 + 1000 + 500 + 200*7 + 40*65 + 30*100

console.log(expectedResult, sum)
