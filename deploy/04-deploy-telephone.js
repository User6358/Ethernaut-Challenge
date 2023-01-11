const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // We only want to deploy this contract on our local network
    // because it is already deployed on testnets by Ethernaut.
    if (developmentChains.includes(network.name)) {
        log("Local network detected => deployement 04 allowed")

        log("04-DEPLOY-START--------------------------------------------")
        log(`Network: ${networkConfig[network.config.chainId]["name"]}`)
        log(`Deploying with ${deployer}`)

        const args = []
        const deployContract = await deploy("Telephone", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        log("04-DEPLOY-END----------------------------------------------")
    } else {
        log("No local network detected => deployment 04 aborted")
    }
}

module.exports.tags = ["all", "challengefour"]
