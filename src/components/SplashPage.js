import React from 'react'

import { Splash } from './index'
import logo from '../logo_transparent.png'

const SplashPage = () => (
    <Splash>
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{margin: '-7rem', fontSize: '1.4rem'}}>An anonymous, fee free, peer-to-peer crypto lending service</div>
    </Splash>
)

export default SplashPage