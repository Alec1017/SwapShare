import React from 'react'

import Button from 'react-bootstrap/Button'

const WalletButton = ({ provider, loadWeb3Modal, logoutOfWeb3Modal }) => {
    return (
      <Button 
        variant="light mr-4"
        onClick={() => !provider ? loadWeb3Modal() : logoutOfWeb3Modal()}
      >
        {!provider ? "Connect Wallet" : "Disconnect Wallet"}
      </Button>
    );
  }

export default WalletButton