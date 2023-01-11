const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("04bis-DEPLOY-START--------------------------------------------")
    chainId = network.config.chainId
    log(`Network: ${networkConfig[chainId]["name"]}`)
    log(`Deploying with ${deployer}`)

    let vulnerableContract
    // Retrieving vulnerable contract's address...
    if (developmentChains.includes(network.name)) {
        // Hardhat localhost
        vulnerableContract = await ethers.getContract("Telephone", deployer)
    } else {
        // Goerli
        vulnerableContract = await ethers.getContractAt(
            "Telephone",
            networkConfig[chainId]["telephoneContractAddress"],
            deployer
        )
    }

    const args = [vulnerableContract.address]
    const deployContract = await deploy("TelephoneAttack", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("04bis-DEPLOY-END----------------------------------------------")
}

module.exports.tags = ["all", "challengefour"]
