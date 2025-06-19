import { createContext, useEffect, useState, useContext } from "react"
import Web3Modal from 'web3modal'
// import dynamic from 'next/dynamic'
// const Web3Modal = dynamic(() => import('web3modal'), { ssr: false });

import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers, providers } from "ethers";
import { MemberContext } from "./MemberContext";
import { useRouter } from 'next/router'

import Testnet_ERC721 from './ABI/testnet/ANI721.json';
import Testnet_ERC1155 from './ABI/testnet/ANI1155.json';
import Testnet_Market from './ABI/testnet/Market.json';
import Testnet_Market_Fee from './ABI/testnet/MarketFee.json';
import Testnet_Auction from './ABI/testnet/Auction.json';
import Testnet_Auction_Fee from './ABI/testnet/AuctionFee.json';

import Mainnet_ERC721 from './ABI/testnet/ANI721.json';
import Mainnet_ERC1155 from './ABI/testnet/ANI1155.json';
import Mainnet_Market from './ABI/testnet/Market.json';
import Mainnet_Market_Fee from './ABI/testnet/MarketFee.json';
import Mainnet_Auction from './ABI/testnet/Auction.json';
import Mainnet_Auction_Fee from './ABI/testnet/AuctionFee.json';

const Web3Context = createContext();

const Web3Provider = ({children}) => {

    const [web3Modal, setWeb3Modal] = useState(null)
    const [account, setAccount] = useState("")
    const [provider, setProvider] = useState(null)
    const [library, setLibrary] = useState(null)
    const [chainId, setChainId] = useState(null)
    const [active, setActive] = useState(false)

    const ABI_ERC721 = process.env.ANI_NETWORK == 'testnet' ? Testnet_ERC721 : Mainnet_ERC721;
    const ABI_ERC1155 = process.env.ANI_NETWORK == 'testnet' ? Testnet_ERC1155 : Mainnet_ERC1155;
    const ABI_Market = process.env.ANI_NETWORK == 'testnet' ? Testnet_Market : Mainnet_Market;
    const ABI_Market_Fee = process.env.ANI_NETWORK == 'testnet' ? Testnet_Market_Fee : Mainnet_Market_Fee;
    const ABI_Auction = process.env.ANI_NETWORK == 'testnet' ? Testnet_Auction : Mainnet_Auction;
    const ABI_Auction_Fee = process.env.ANI_NETWORK == 'testnet' ? Testnet_Auction_Fee : Mainnet_Auction_Fee;

    const router = useRouter()

    const {member, signIn, signOut} = useContext(MemberContext)

    const POLLING_INTERVAL = 12000

    useEffect(() => {
        
        // initiate web3modal
        const providerOptions = {
            walletconnect: {
                package: WalletConnectProvider,
                options: {
                  // infuraId: "57d3a2899bf2476eaa8a31ce47eeb591"  //process.env.NEXT_PUBLIC_INFURA_ID,
                  rpc: {
                    1: process.env.ANI_RPC_URL
                    //56: "https://bsc-dataseed.binance.org/"
                    //1: "https://mainnet.mycustomnode.com",
                    //3: "https://ropsten.mycustomnode.com",
                    //100: "https://dai.poa.network",
                    // ...
                  },
                  //network: 'Binance',
                }
                // options: {
                //   infuraId: process.env.ANI_INFURA_ID
                // }
              }
        };
        
        console.log("ANI_RPC_URL", process.env.ANI_RPC_URL);

        if (typeof window !== 'undefined') {
          const newWeb3Modal = new Web3Modal({
              cacheProvider: true, // very important
              //network: "mainnet",
              providerOptions,
              theme: 'dark'
          });
          setWeb3Modal(newWeb3Modal)
        }
    
    }, [])

    useEffect(() => {
      // connect automatically and without a popup if user is already connected
      if(web3Modal && web3Modal.cachedProvider){
        connectWallet()
      }
    }, [web3Modal])

    const connectWallet = async() => {
      console.log("connectWallet");
      const provider = await web3Modal.connect();

      addListeners(provider);

      const etherProvider = new providers.Web3Provider(provider)
      etherProvider.pollingInterval = POLLING_INTERVAL      

      const walletAddress = await etherProvider.getSigner().getAddress()
      console.log("walletAddress", walletAddress);
      setAccount(walletAddress)
      
      const network = await etherProvider.getNetwork();

      setChainId(network.chainId)
      setLibrary(etherProvider)      
      setProvider(provider)
      setActive(true)

      // let signature = await signMessage("This is just extra security that you own this wallet address " + walletAddress)
      // let authorized = await signIn(walletAddress, signature)
      // console.log("authorized", authorized);
      // if(authorized.Success){
      //     localStorage.setItem("AnifieAdminAddress", walletAddress)
      //     localStorage.setItem("AnifieAdminSignature", signature)
      //     //router.push("/index")
      //     window.location.reload()
      // }
      // else {
      //     console.error(authorized.Message);
      // }
      
    }

    const disconnectWallet = async() => {
      
      console.log("disconnectWallet");

      try {
        await web3Modal.clearCachedProvider()
        if (provider?.disconnect && typeof provider.disconnect === 'function') {
          await provider.disconnect()
        }
      } catch (error) {
        console.error(error)
      }
      setAccount(null)
      setActive(false)
      setLibrary(null)
      setProvider(null)
    }

    // const getLibrary = () => {
    //   const httpProvider = new web3.providers.HttpProvider("https://rinkeby.infura.io/v3/57d3a2899bf2476eaa8a31ce47eeb591");  // process.env.ANI_RPC_URL
    //   const web3NoAccount = new ethers.providers.Web3Provider(httpProvider);
    //   web3NoAccount.pollingInterval = POLLING_INTERVAL;
    //   return web3NoAccount;
    // }

    const addListeners = async(web3ModalProvider) => {

      web3ModalProvider.on("connect", (info) => {
        console.log("connect event");
        setChainId(parseInt(info.chainId));
        //window.location.reload()
      });

      web3ModalProvider.on("accountsChanged", (accounts) => {
        console.log("accountsChanged event");
        // if(active)
        // {
            if (accounts.length > 0) {
              console.log("set to account", accounts[0]);
              setAccount(accounts[0]);
              //await disconnectWallet();
              signOut();

              //await signIn(accounts[0]);

            } else {
              //await disconnectWallet();
              signOut();
            }
        // }

        //router.push("/login");

        window.location.reload()
      });
      
      // Subscribe to chainId change
      web3ModalProvider.on("chainChanged", (chainId) => {
        console.log("chainChanged event");
        // if(active.value)
        // {
          setChainId(parseInt(chainId))
        // }

        //window.location.reload()
      });
    }

    const signMessage = async (message) => {
      console.log('signMessage', message);
  
      try {
          const provider = new ethers.providers.Web3Provider(library.provider);
          const signer = provider.getSigner();
          const sig = await signer.signMessage(message);
          return sig;
      } catch (error) {
        console.error(error)
          // callbackFailed('signMessage failed');
      }
    }

    const grantRoleNFT721Minter = async (walletAddress, callbackFailed) => {
      console.log("grantRoleNFT721Minter", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.grantRole(await contractWithSigner.MINTER_ROLE(), walletAddress);

        console.log('grantRoleNFT721Minter - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('grantRoleNFT721Minter - receipt', receipt);
        console.log('grantRoleNFT721Minter - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('grantRoleNFT721Minter failed')
      }
    }

    const grantRoleNFT1155Minter = async (walletAddress, callbackFailed) => {
      console.log("grantRoleNFT1155Minter", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.grantRole(await contractWithSigner.MINTER_ROLE(), walletAddress);

        console.log('grantRoleNFT1155Minter - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('grantRoleNFT1155Minter - receipt', receipt);
        console.log('grantRoleNFT1155Minter - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('grantRoleNFT1155Minter failed')
      }
    }

    const grantRoleNFT721Pauser = async (walletAddress, callbackFailed) => {
      console.log("grantRoleNFT721Pauser", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.grantRole(await contractWithSigner.PAUSER_ROLE(), walletAddress);

        console.log('grantRoleNFT721Pauser - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('grantRoleNFT721Pauser - receipt', receipt);
        console.log('grantRoleNFT721Pauser - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('grantRoleNFT721Pauser failed')
      }
    }

    const grantRoleNFT1155Pauser = async (walletAddress, callbackFailed) => {
      console.log("grantRoleNFT1155Pauser", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.grantRole(await contractWithSigner.PAUSER_ROLE(), walletAddress);

        console.log('grantRoleNFT1155Pauser - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('grantRoleNFT1155Pauser - receipt', receipt);
        console.log('grantRoleNFT1155Pauser - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('grantRoleNFT1155Pauser failed')
      }
    }

    const addMarketFeeOperator = async (walletAddress, callbackFailed) => {
      console.log("addMarketFeeOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET_FEE, ABI_Market_Fee, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.addOperator(walletAddress);

        console.log('addMarketFeeOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('addMarketFeeOperator - receipt', receipt);
        console.log('addMarketFeeOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('addMarketFeeOperator failed')
      }
    }

    const addAuctionFeeOperator = async (walletAddress, callbackFailed) => {
      console.log("addAuctionFeeOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION_FEE, ABI_Auction_Fee, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.addOperator(walletAddress);

        console.log('addAuctionFeeOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('addAuctionFeeOperator - receipt', receipt);
        console.log('addAuctionFeeOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('addAuctionFeeOperator failed')
      }
    }

    const addMarketOperator = async (walletAddress, callbackFailed) => {
      console.log("addMarketOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET, ABI_Market, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.addOperator(walletAddress);

        console.log('addMarketOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('addMarketOperator - receipt', receipt);
        console.log('addMarketOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('addMarketOperator failed')
      }
    }

    const addAuctionOperator = async (walletAddress, callbackFailed) => {
      console.log("addAuctionOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION, ABI_Auction, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.addOperator(walletAddress);

        console.log('addAuctionOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('addAuctionOperator - receipt', receipt);
        console.log('addAuctionOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('addAuctionOperator failed')
      }
    }

    const addNFT721Operator = async (walletAddress, callbackFailed) => {
      console.log("addNFT721Operator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.addOperator(walletAddress);

        console.log('addNFT721Operator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('addNFT721Operator - receipt', receipt);
        console.log('addNFT721Operator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('addNFT721Operator failed')
      }
    }

    const addNFT1155Operator = async (walletAddress, callbackFailed) => {
      console.log("addNFT1155Operator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.addOperator(walletAddress);

        console.log('addNFT1155Operator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('addNFT1155Operator - receipt', receipt);
        console.log('addNFT1155Operator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('addNFT1155Operator failed')
      }
    }

    const revokeRoleNFT721Minter = async (walletAddress, callbackFailed) => {
      console.log("revokeRoleNFT721Minter", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.revokeRole(await contractWithSigner.MINTER_ROLE(), walletAddress);

        console.log('revokeRoleNFT721Minter - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('revokeRoleNFT721Minter - receipt', receipt);
        console.log('revokeRoleNFT721Minter - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('revokeRoleNFT721Minter failed')
      }
    }

    const revokeRoleNFT1155Minter = async (walletAddress, callbackFailed) => {
      console.log("revokeRoleNFT1155Minter", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.revokeRole(await contractWithSigner.MINTER_ROLE(), walletAddress);

        console.log('revokeRoleNFT1155Minter - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('revokeRoleNFT1155Minter - receipt', receipt);
        console.log('revokeRoleNFT1155Minter - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('revokeRoleNFT1155Minter failed')
      }
    }

    const revokeRoleNFT721Pauser = async (walletAddress, callbackFailed) => {
      console.log("revokeRoleNFT721Pauser", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.revokeRole(await contractWithSigner.PAUSER_ROLE(), walletAddress);

        console.log('revokeRoleNFT721Pauser - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('revokeRoleNFT721Pauser - receipt', receipt);
        console.log('revokeRoleNFT721Pauser - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('revokeRoleNFT721Pauser failed')
      }
    }

    const revokeRoleNFT1155Pauser = async (walletAddress, callbackFailed) => {
      console.log("revokeRoleNFT1155Pauser", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.revokeRole(await contractWithSigner.PAUSER_ROLE(), walletAddress);

        console.log('revokeRoleNFT1155Pauser - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('revokeRoleNFT1155Pauser - receipt', receipt);
        console.log('revokeRoleNFT1155Pauser - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('revokeRoleNFT1155Pauser failed')
      }
    }

    const removeMarketFeeOperator = async (walletAddress, callbackFailed) => {
      console.log("removeMarketFeeOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET_FEE, ABI_Market_Fee, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.removeOperator(walletAddress);

        console.log('removeMarketFeeOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('removeMarketFeeOperator - receipt', receipt);
        console.log('removeMarketFeeOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('removeMarketFeeOperator failed')
      }
    }

    const removeAuctionFeeOperator = async (walletAddress, callbackFailed) => {
      console.log("removeAuctionFeeOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION_FEE, ABI_Auction_Fee, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.removeOperator(walletAddress);

        console.log('removeAuctionFeeOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('removeAuctionFeeOperator - receipt', receipt);
        console.log('removeAuctionFeeOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('removeAuctionFeeOperator failed')
      }
    }

    const removeMarketOperator = async (walletAddress, callbackFailed) => {
      console.log("removeMarketOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET, ABI_Market, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.removeOperator(walletAddress);

        console.log('removeMarketOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('removeMarketOperator - receipt', receipt);
        console.log('removeMarketOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('removeMarketOperator failed')
      }
    }

    const removeAuctionOperator = async (walletAddress, callbackFailed) => {
      console.log("removeAuctionOperator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION, ABI_Auction, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.removeOperator(walletAddress);

        console.log('removeAuctionOperator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('removeAuctionOperator - receipt', receipt);
        console.log('removeAuctionOperator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('removeAuctionOperator failed')
      }
    }

    const removeNFT721Operator = async (walletAddress, callbackFailed) => {
      console.log("removeNFT721Operator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.removeOperator(walletAddress);

        console.log('removeNFT721Operator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('removeNFT721Operator - receipt', receipt);
        console.log('removeNFT721Operator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('removeNFT721Operator failed')
      }
    }

    const removeNFT1155Operator = async (walletAddress, callbackFailed) => {
      console.log("removeNFT1155Operator", walletAddress);

      try {
        const provider = new ethers.providers.Web3Provider(library.provider);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider);
        const contractWithSigner = contract.connect(signer);
        var tx = await contractWithSigner.removeOperator(walletAddress);

        console.log('removeNFT1155Operator - tx', tx);
        await provider.waitForTransaction(tx.hash);
        let receipt = await provider.getTransactionReceipt(tx.hash);
        console.log('removeNFT1155Operator - receipt', receipt);
        console.log('removeNFT1155Operator - transactionHash', receipt.transactionHash);
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('removeNFT1155Operator failed')
      }
    }

    const setStorageFeeBeneficiary721 = async (walletAddress, callbackFailed) => {
      console.log("setStorageFeeBeneficiary721", walletAddress)

      try {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBeneficiary(walletAddress)

        console.log('setStorageFeeBeneficiary721 - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setStorageFeeBeneficiary721 - receipt', receipt)
        console.log('setStorageFeeBeneficiary721 - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setStorageFeeBeneficiary721 failed')
      }
    }

    const setStorageFeeBeneficiary1155 = async (walletAddress, callbackFailed) => {
      console.log("setStorageFeeBeneficiary1155", walletAddress)

      try {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBeneficiary(walletAddress)

        console.log('setStorageFeeBeneficiary1155 - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setStorageFeeBeneficiary1155 - receipt', receipt)
        console.log('setStorageFeeBeneficiary1155 - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setStorageFeeBeneficiary1155 failed')
      }
    }

    const setStorageFee721 = async (amount, currencyCode, callbackFailed) => {
      console.log("setStorageFee721", amount, currencyCode)

      try {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()

        var tokenContract = null
        var fee = null
        switch (currencyCode) {
          case "ETH":
            tokenContract = process.env.ANI_CONTRACT_ETH
            fee = ethers.utils.parseEther(amount + '')  //e.g. {"type":"BigNumber","hex":"0x0186a0"}
            break

          case "USDT":
            tokenContract = process.env.ANI_CONTRACT_USDT
            fee = ethers.utils.parseUnits(amount + '', 6)
            break
            
          default:
            break
        }

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC721, ABI_ERC721, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setStorageFee({"assetType":1,"token":tokenContract,"fee":fee})

        console.log('setStorageFee721 - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setStorageFee721 - receipt', receipt)
        console.log('setStorageFee721 - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setStorageFee721 failed')
      }
    }

    const setStorageFee1155 = async (amount, currencyCode, callbackFailed) => {
      console.log("setStorageFee1155", amount, currencyCode)

      try {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()

        var tokenContract = null
        var fee = null
        switch (currencyCode) {
          case "ETH":
            tokenContract = process.env.ANI_CONTRACT_ETH
            fee = ethers.utils.parseEther(amount + '')  //e.g. {"type":"BigNumber","hex":"0x0186a0"}
            break

          case "USDT":
            tokenContract = process.env.ANI_CONTRACT_USDT
            fee = ethers.utils.parseUnits(amount + '', 6)
            break
            
          default:
            break
        }

        const contract = new ethers.Contract(process.env.ANI_CONTRACT_ERC1155, ABI_ERC1155, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setStorageFee({"assetType":1,"token":tokenContract,"fee":fee})

        console.log('setStorageFee1155 - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setStorageFee1155 - receipt', receipt)
        console.log('setStorageFee1155 - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setStorageFee1155 failed')
      }
    }

    const setMarketFeeBeneficiary = async (walletAddress, callbackFailed) => {
      console.log("setMarketFeeBeneficiary", walletAddress)

      try {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET, ABI_Market, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBeneficiary(walletAddress)

        console.log('setMarketFeeBeneficiary - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setMarketFeeBeneficiary - receipt', receipt)
        console.log('setMarketFeeBeneficiary - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setMarketFeeBeneficiary failed')
      }
    }

    const setMarketBuyerFeePercentageETH = async (buyerFeePercentage, callbackFailed) => {
      console.log("setMarketBuyerFeePercentageETH", buyerFeePercentage)

      try {

        const buyerFeeInBasisPoint = (+buyerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET_FEE, ABI_Market_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBuyerFee({"token":process.env.ANI_CONTRACT_ETH,"tokenId":0,"assetType":1}, buyerFeeInBasisPoint)

        console.log('setMarketBuyerFeePercentageETH - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setMarketBuyerFeePercentageETH - receipt', receipt)
        console.log('setMarketBuyerFeePercentageETH - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setMarketBuyerFeePercentageETH failed')
      }
    }

    const setMarketBuyerFeePercentageUSDT = async (buyerFeePercentage, callbackFailed) => {
      console.log("setMarketBuyerFeePercentageUSDT", buyerFeePercentage)

      try {

        const buyerFeeInBasisPoint = (+buyerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET_FEE, ABI_Market_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBuyerFee({"token":process.env.ANI_CONTRACT_USDT,"tokenId":0,"assetType":1}, buyerFeeInBasisPoint)

        console.log('setMarketBuyerFeePercentageUSDT - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setMarketBuyerFeePercentageUSDT - receipt', receipt)
        console.log('setMarketBuyerFeePercentageUSDT - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setMarketBuyerFeePercentageUSDT failed')
      }
    }

    const setMarketSellerFeePercentageETH = async (sellerFeePercentage, callbackFailed) => {
      console.log("setMarketSellerFeePercentageETH", sellerFeePercentage)

      try {

        const sellerFeeInBasisPoint = (+sellerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET_FEE, ABI_Market_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setSellerFee({"token":process.env.ANI_CONTRACT_ETH,"tokenId":0,"assetType":1}, sellerFeeInBasisPoint)

        console.log('setMarketSellerFeePercentageETH - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setMarketSellerFeePercentageETH - receipt', receipt)
        console.log('setMarketSellerFeePercentageETH - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setMarketSellerFeePercentageETH failed')
      }
    }

    const setMarketSellerFeePercentageUSDT = async (sellerFeePercentage, callbackFailed) => {
      console.log("setMarketSellerFeePercentageUSDT", sellerFeePercentage)

      try {

        const sellerFeeInBasisPoint = (+sellerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET_FEE, ABI_Market_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setSellerFee({"token":process.env.ANI_CONTRACT_USDT,"tokenId":0,"assetType":1}, sellerFeeInBasisPoint)

        console.log('setMarketSellerFeePercentageUSDT - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setMarketSellerFeePercentageUSDT - receipt', receipt)
        console.log('setMarketSellerFeePercentageUSDT - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setMarketSellerFeePercentageUSDT failed')
      }
    }

    const setAuctionFeeBeneficiary = async (walletAddress, callbackFailed) => {
      console.log("setAuctionFeeBeneficiary", walletAddress)

      try {
        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION, ABI_Auction, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBeneficiary(walletAddress)

        console.log('setAuctionFeeBeneficiary - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setAuctionFeeBeneficiary - receipt', receipt)
        console.log('setAuctionFeeBeneficiary - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setAuctionFeeBeneficiary failed')
      }
    }

    const setAuctionBuyerFeePercentageETH = async (buyerFeePercentage, callbackFailed) => {
      console.log("setAuctionBuyerFeePercentageETH", buyerFeePercentage)

      try {

        const buyerFeeInBasisPoint = (+buyerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION_FEE, ABI_Auction_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBuyerFee({"token":process.env.ANI_CONTRACT_ETH,"tokenId":0,"assetType":1}, buyerFeeInBasisPoint)

        console.log('setAuctionBuyerFeePercentageETH - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setAuctionBuyerFeePercentageETH - receipt', receipt)
        console.log('setAuctionBuyerFeePercentageETH - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setAuctionBuyerFeePercentageETH failed')
      }
    }

    const setAuctionBuyerFeePercentageUSDT = async (buyerFeePercentage, callbackFailed) => {
      console.log("setAuctionBuyerFeePercentageUSDT", buyerFeePercentage)

      try {

        const buyerFeeInBasisPoint = (+buyerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION_FEE, ABI_Auction_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setBuyerFee({"token":process.env.ANI_CONTRACT_USDT,"tokenId":0,"assetType":1}, buyerFeeInBasisPoint)

        console.log('setAuctionBuyerFeePercentageUSDT - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setAuctionBuyerFeePercentageUSDT - receipt', receipt)
        console.log('setAuctionBuyerFeePercentageUSDT - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setAuctionBuyerFeePercentageUSDT failed')
      }
    }

    const setAuctionSellerFeePercentageETH = async (sellerFeePercentage, callbackFailed) => {
      console.log("setAuctionSellerFeePercentageETH", sellerFeePercentage)

      try {

        const sellerFeeInBasisPoint = (+sellerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION_FEE, ABI_Auction_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setSellerFee({"token":process.env.ANI_CONTRACT_ETH,"tokenId":0,"assetType":1}, sellerFeeInBasisPoint)

        console.log('setAuctionSellerFeePercentageETH - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setAuctionSellerFeePercentageETH - receipt', receipt)
        console.log('setAuctionSellerFeePercentageETH - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setAuctionSellerFeePercentageETH failed')
      }
    }

    const setAuctionSellerFeePercentageUSDT = async (sellerFeePercentage, callbackFailed) => {
      console.log("setAuctionSellerFeePercentageUSDT", sellerFeePercentage)

      try {

        const sellerFeeInBasisPoint = (+sellerFeePercentage) * 100

        const provider = new ethers.providers.Web3Provider(library.provider)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION_FEE, ABI_Auction_Fee, provider)
        const contractWithSigner = contract.connect(signer)
        var tx = await contractWithSigner.setSellerFee({"token":process.env.ANI_CONTRACT_USDT,"tokenId":0,"assetType":1}, sellerFeeInBasisPoint)

        console.log('setAuctionSellerFeePercentageUSDT - tx', tx)
        await provider.waitForTransaction(tx.hash)
        let receipt = await provider.getTransactionReceipt(tx.hash)
        console.log('setAuctionSellerFeePercentageUSDT - receipt', receipt)
        console.log('setAuctionSellerFeePercentageUSDT - transactionHash', receipt.transactionHash)
        
        return { 
                 transactionHash: receipt.transactionHash
              }

      } catch (error) {
        console.error(error)
        callbackFailed('setAuctionSellerFeePercentageUSDT failed')
      }
    }
    
    const cancelAuctionOnChain = async (auctionId) => {
      console.log('cancelAuctionOnChain', auctionId)

      const provider = new ethers.providers.Web3Provider(library.provider)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION, ABI_Auction, provider)
      const contractWithSigner = contract.connect(signer);

      try {
          var tx = await contractWithSigner.cancel(auctionId)
          console.log('cancelAuctionOnChain - hash', tx.hash)
          await provider.waitForTransaction(tx.hash)
          let receipt = await provider.getTransactionReceipt(tx.hash)
          console.log('cancelAuctionOnChain - receipt', receipt)

          return tx.hash

      } catch (error) {
          console.error('cancelAuctionOnChain failed', error)
          return null
      }
    }

    const settleAuctionOnChain = async (auctionId) => {
      console.log(logName, 'settleAuctionOnChain', auctionId)
  
      const provider = new ethers.providers.Web3Provider(library.provider)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(process.env.ANI_CONTRACT_AUCTION, ABI_Auction, provider)
      const contractWithSigner = contract.connect(signer)
  
      try {
          var tx = await contractWithSigner.settle(auctionId)
          console.log(logName, 'settleAuctionOnChain - hash', tx.hash)
          await provider.waitForTransaction(tx.hash)
          let receipt = await provider.getTransactionReceipt(tx.hash)
          console.log(logName, 'settleAuctionOnChain - receipt', receipt)
  
          return tx.hash
  
      } catch (error) {
          console.error(logName, 'settleAuctionOnChain failed', error)
          return null
      }
    }

    const cancelSellOnChain = async (sellOrderId) => {
      console.log('cancelSellOnChain', sellOrderId);

      const provider = new ethers.providers.Web3Provider(library.provider)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(process.env.ANI_CONTRACT_MARKET, ABI_Market, provider)
      const contractWithSigner = contract.connect(signer)

      try {
          var tx = await contractWithSigner.cancel(sellOrderId)
          console.log('cancelSellOnChain - hash', tx.hash)
          await provider.waitForTransaction(tx.hash)
          let receipt = await provider.getTransactionReceipt(tx.hash)
          console.log('cancelSellOnChain - receipt', receipt)

          return tx.hash

      } catch (error) {
          console.error('cancelSellOnChain failed', error)
          return null
      }
    }
    
    return (
        <Web3Context.Provider value={{
                                      account, 
                                      chainId, 
                                      connectWallet, 
                                      disconnectWallet, 
                                      signMessage, 
                                      grantRoleNFT721Minter, 
                                      grantRoleNFT1155Minter,
                                      grantRoleNFT721Pauser,
                                      grantRoleNFT1155Pauser,
                                      addMarketFeeOperator,
                                      addAuctionFeeOperator,
                                      addMarketOperator,
                                      addAuctionOperator,
                                      addNFT721Operator,
                                      addNFT1155Operator,
                                      revokeRoleNFT721Minter,
                                      revokeRoleNFT1155Minter,
                                      revokeRoleNFT721Pauser,
                                      revokeRoleNFT1155Pauser,
                                      removeMarketFeeOperator,
                                      removeAuctionFeeOperator,
                                      removeMarketOperator,
                                      removeAuctionOperator,
                                      removeNFT721Operator,
                                      removeNFT1155Operator,
                                      cancelAuctionOnChain,
                                      settleAuctionOnChain,
                                      cancelSellOnChain,
                                      setStorageFeeBeneficiary721,
                                      setStorageFeeBeneficiary1155,
                                      setStorageFee721,
                                      setStorageFee1155,
                                      setMarketBuyerFeePercentageETH,
                                      setMarketBuyerFeePercentageUSDT,
                                      setMarketSellerFeePercentageETH,
                                      setMarketSellerFeePercentageUSDT,
                                      setMarketFeeBeneficiary,
                                      setAuctionBuyerFeePercentageETH,
                                      setAuctionBuyerFeePercentageUSDT,
                                      setAuctionSellerFeePercentageETH,
                                      setAuctionSellerFeePercentageUSDT,
                                      setAuctionFeeBeneficiary
                                    }}>
            {children}
        </Web3Context.Provider>
    );
};

export {Web3Context, Web3Provider};