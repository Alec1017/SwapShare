// The transaction states of a loan
export const LOAN_STATE = {
    requested: "0",
    canceled:  "1",
    fulfilled: "2",
    settled:   "3",
    defaulted: "4"
}

// These are the metamask chain IDs of ETH nets
export const METAMASK_NETWORKS = {
    mainnet: "1",
    ropsten: "3",
    rinkeby: "4",
    goerli: "5",
    kovan: "42",
    ganache: "5777"
}

// Time (in seconds) for Day, Hour, Minute
export const TIME_SECONDS = {
    day: 86400,
    hour: 3600,
    minute: 60
}
