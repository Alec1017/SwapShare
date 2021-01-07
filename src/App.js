import React, { useEffect, useState } from 'react'
import Web3 from 'web3'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

import SwapShareABI from './abis/SwapShare.json'
import TestnetDAI from './abis/TestnetDAI.json'

import './App.css'

import { METAMASK_NETWORKS } from './Constants'

import { Header, WrongNetHeader } from './components'
import SplashPage from './components/SplashPage'
import WalletButton from './components/WalletButton'
import SwapShare from './components/SwapShare'
import OpenLoans from './components/OpenLoans'

import useWeb3Modal from './hooks/useWeb3Modal'


const App = () => {
  const [web3, setWeb3] = useState(null)
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal()

  const [swapShareContract, setSwapShareContract] = useState(null)
  const [DAIContract, setDAIContract] = useState(null)

  const[isCorrectNetwork, setIsCorrectNetwork] = useState(true)

  useEffect(() => {
    setIsCorrectNetwork(METAMASK_NETWORKS.ganache == window.ethereum.networkVersion)

    window.ethereum.on('chainChanged', (_chainId) => window.location.reload())
    window.ethereum.on('accountsChanged', (accounts) => {
      setAccount(accounts[0])
    })

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
      setSwapShareContract(new web3.eth.Contract(
        SwapShareABI.abi,
        SwapShareABI.networks[networkID].address
      ))

      setDAIContract(new web3.eth.Contract(
        TestnetDAI.abi,
        TestnetDAI.networks[networkID].address
      ))
    }
  }, [web3])


  return (
    <Router>
      <div className="App">
        <div>
          {isCorrectNetwork 
            ? <Header>
                <div className="ml-4">
                  {web3 && swapShareContract && account &&
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <div style={{minWidth: '10rem'}}>
                        <Link style={{color: 'white'}} to='/'>Your Activity</Link>
                      </div>
                      <div style={{minWidth: '5rem'}}>
                        <Link style={{color: 'white'}} to='/open-loans'>View Open Loans</Link>
                      </div>
                    </div>
                  }
                </div> 
        
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div className="mr-4">{account}</div>
                  <WalletButton 
                    provider={provider} 
                    loadWeb3Modal={loadWeb3Modal}
                    logoutOfWeb3Modal={logoutOfWeb3Modal} />
                </div>
              </Header>
            : <WrongNetHeader>
                <div>Swap Share is currently only available on the Rinkeby Testnet</div>
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
