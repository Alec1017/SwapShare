import { useCallback, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

// Enter a valid infura key here to avoid being rate limited
// You can get a key for free at https://infura.io/register
const INFURA_ID = "INVALID_INFURA_KEY";

const NETWORK_NAME = "mainnet";

function useWeb3Modal(config = {}) {
  const [provider, setProvider] = useState();
  const { infuraId = INFURA_ID, NETWORK = NETWORK_NAME } = config;

  // Web3Modal also supports many other wallets.
  // You can see other options at https://github.com/Web3Modal/web3modal
  const web3Modal = new Web3Modal({
    network: NETWORK,
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId,
        },
      },
    },
  });

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    let newProvider = null;
    try {
      newProvider = await web3Modal.connect();
    } catch (error) {
      // Modal was closed by user, we dont have to do anything
    }

    if (newProvider) {
      setProvider(new Web3Provider(newProvider));
    }
  }, [web3Modal]);

  // Disconnect from wallet
  const logoutOfWeb3Modal = useCallback(async () => {
    if (window.web3.currentProvider && window.web3.currentProvider.close) {
      await window.web3.currentProvider.close();
    }
    web3Modal.clearCachedProvider();
    window.location.reload();
    setProvider(null);
  }, [web3Modal]);

  return [provider, loadWeb3Modal, logoutOfWeb3Modal];
}

export default useWeb3Modal;
