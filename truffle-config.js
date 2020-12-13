
module.exports = {
  networks: {
    development: {
      host: "172.21.96.1",
      port: 8545,
      network_id: "*" // Match any network id
    }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "petersburg"
    }
  }
}
