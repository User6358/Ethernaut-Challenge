const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // We only want to deploy this contract on our local network
    // because it is already deployed on testnets by Ethernaut.
    if (developmentChains.includes(network.name)) {
        log("Local network detected => deployement 02 allowed")

        log("02-DEPLOY-START--------------------------------------------")
        log(`Network: ${networkConfig[network.config.chainId]["name"]}`)
        log(`Deploying with ${deployer}`)

        const args = []
        const deployContract = await deploy("Fallout", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })
        log("02-DEPLOY-END----------------------------------------------")
    } else {
        log("No local network detected => deployment 02 aborted")
    }
}

module.exports.tags = ["all", "challengetwo"]
