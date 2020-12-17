import React from 'react'

import { Button } from "./index"

const WalletButton = ({ provider, loadWeb3Modal, logoutOfWeb3Modal }) => {
    return (
      <Button onClick={() => !provider ? loadWeb3Modal() : logoutOfWeb3Modal()}>
        {!provider ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
    );
  }

export default WalletButton