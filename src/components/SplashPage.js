import React from 'react'

import { Splash } from './index'
import logo from '../logo_transparent.png'

const SplashPage = () => (
    <Splash>
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{margin: '-6rem', fontSize: '1.3rem'}}>An anonymous, direct peer-to-peer crypto lending service</div>
    </Splash>
)

export default SplashPage