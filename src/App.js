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
import logo from './logo.svg'

import { Header, Splash } from './components'
import WalletButton from './components/WalletButton'
import SwapShare from './components/SwapShare'

import useWeb3Modal from './hooks/useWeb3Modal'


const App = () => {
  const [web3, setWeb3] = useState(null)
  const [networkID, setNetworkID] = useState(null)
  const [account, setAccount] = useState(null)
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal()

  const [swapShareContract, setSwapShareContract] = useState(null)
  const [DAIContract, setDAIContract] = useState(null)

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
        <Header>
          {web3 && swapShareContract && account &&
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <div style={{minWidth: '5rem'}}>
                <Link to='/'>home</Link>
              </div>
              <div style={{minWidth: '5rem'}}>
                <Link to='/2'>another link</Link>
              </div>
            </div> 
          }

          <div>
            <div className="mr-2">{account}</div>
            <WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
          </div>
        </Header>
        <Route path='/'>
          {web3 && swapShareContract && account
            ? <SwapShare web3={web3} account={account} swapShareContract={swapShareContract} DAIContract={DAIContract} />
            : <Splash>
                <img src={logo} className="App-logo" alt="logo" />
                <div style={{fontSize: '2rem'}}>SwapShare</div>
                <div>An anonymous, direct peer-to-peer crypto lending service</div>
              </Splash>
          }
        </Route>
        <Route path='/2'>
          test a second route
        </Route>
      </div>
    </Router>
  );
}

export default App
