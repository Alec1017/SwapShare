import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

import SwapShareABI from './abis/SwapShare.json'
import SwapShareDAI from './abis/SwapShareDAI.json'

import './App.css'

import { METAMASK_NETWORKS } from './Constants'

import { Header, WrongNetHeader } from './components'
import SplashPage from './components/SplashPage'
import WalletButton from './components/WalletButton'
import SwapShare from './components/SwapShare'
import OpenLoans from './components/OpenLoans'
import GetMockDAI from './components/GetMockDAI'

import useWeb3Modal from './hooks/useWeb3Modal'


const App = () => {
  const [web3, setWeb3] = useState(null)
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal()
  const [metamaskDetected, setMetamaskDetected] = useState(true)

  const [swapShareContract, setSwapShareContract] = useState(null)
  const [DAIContract, setDAIContract] = useState(null)

  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (window.ethereum) {      
      setIsCorrectNetwork(METAMASK_NETWORKS.ropsten === window.ethereum.networkVersion)

      window.ethereum.on('chainChanged', (_chainId) => window.location.reload())
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0])
      })
    } else {
      setMetamaskDetected(false)
    }
  }, [])

  useEffect(() => {
    if (provider != null) {
      window.ethereum.autoRefreshOnNetworkChange = false

      setNetworkID(window.ethereum.networkVersion)
      window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
        setAccount(accounts[0])
      })
      setWeb3(new Web3(provider))
    }
  }, [provider])


  useEffect(() => {
    if (web3 != null) {
      setIsConnected(true)

      setSwapShareContract(new web3.eth.Contract(
        SwapShareABI.abi,
        SwapShareABI.networks[networkID].address
      ))

      setDAIContract(new web3.eth.Contract(
        SwapShareDAI.abi,
        SwapShareDAI.networks[networkID].address
      ))
    }
  }, [web3])


  return (
    <Router>
      <div className="App">
        <div>
          {(isCorrectNetwork && metamaskDetected)
            ? <Header>
                <div className="ml-4">
                  {web3 && swapShareContract && account &&
                    <div style={{display: 'flex', justifyContent: 'space-between', minWidth: '30rem'}}>
                      <div>
                        <Link style={{color: 'white'}} to='/'>Your Activity</Link>
                      </div>
                      <div>
                        <Link style={{color: 'white'}} to='/open-loans'>View Open Loans</Link>
                      </div>
                      <div>
                        <Link style={{color: 'white'}} to='/ropsten-dai'>Get Ropsten DAI</Link>
                      </div>
                    </div>
                  }
                </div> 
        
                <div style={{display: 'flex', alignItems: 'center'}}>
                  {isConnected && <div className="mr-4">{account}</div>}
                  <WalletButton 
                    provider={provider} 
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal} />
                </div>
              </Header>
            : <WrongNetHeader>
                {!isCorrectNetwork && <div>Swap Share is currently only available on the Ropsten Testnet</div>}
                {!metamaskDetected && <div>Please download the MetaMask Wallet browser extension</div>}
              </WrongNetHeader>
          }
        </div>
        <Switch>
          <Route path='/open-loans'>
            {web3 && swapShareContract && account
              ? <OpenLoans web3={web3} account={account} swapShareContract={swapShareContract} />
              : <SplashPage />
            } 
          </Route>
          <Route path='/ropsten-dai'>
            {web3 && swapShareContract && account
              ? <GetMockDAI account={account} DAIContract={DAIContract} />
              : <SplashPage />
            } 
          </Route>
          <Route path='/'>
            {web3 && swapShareContract && account
              ? <SwapShare web3={web3} account={account} swapShareContract={swapShareContract} DAIContract={DAIContract} />
              : <SplashPage />
            }
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App
