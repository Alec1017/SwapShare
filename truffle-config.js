const HDWalletProvider = require("@truffle/hdwallet-provider")
require('dotenv').config()

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => 
        new HDWalletProvider({
          mnemonic: {
            phrase: process.env.SEED_PHRASE
          },
          providerOrUrl: process.env.RINKEBY_INFURA_ENDPOINT
        }),
      network_id: 4
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.6.0"
    }
  }
}
