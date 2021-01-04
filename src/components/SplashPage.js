import React from 'react'

import { Splash } from './index'
import logo from '../logo.svg'

const SplashPage = () => (
    <Splash>
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{fontSize: '2rem'}}>SwapShare</div>
        <div>An anonymous, direct peer-to-peer crypto lending service</div>
    </Splash>
)

export default SplashPage