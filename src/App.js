import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {
  // Just a state variable we use to store our user's public wallet address.
  const [currAccount, setCurrentAccount] = React.useState("")
  const [totalWaves, setTotalWaves] = React.useState(0)
  const [allWaves, setAllWaves] = React.useState([])
  const contractAddress = "0xC3203252DE0394F3D6ea8B035e0a7cE4617968Ba"
  const contractABI = abi.abi

  const checkIfWalletIsConnected = () => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have metamask!")
      return
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to access user's wallet
    ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      // We could have multiple accounts. Check for one.
      if (accounts.length !== 0) {
        // Grab the first account we have access to.
        const account = accounts[0];
        console.log("Found an authorized account: ", account);

        // Store the users public wallet address for later!
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!")
    }

    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
    })
    .catch(err => console.log(err));
  }
  
  // This runs our function when the page loads.
  React.useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves()
    setTotalWaves(count.toNumber())
    console.log("Retrieved total wave count...", count.toNumber())

    const waveTxn = await waveportalContract.wave("This is a message")
    console.log("Mining....", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined --", waveTxn.hash)

    count = await waveportalContract.getTotalWaves()
    setTotalWaves(count.toNumber())
    console.log("Retrieved total wave count...", count.toNumber())
  }

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let waves = await waveportalContract.getAllWaves()

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
  }
  
  const displayAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Wave the block
        </div>
        <div className="bio">
          Send me a public message on the blockchain and there is a 50% chance to win some ETH!
        </div>
        <textarea className="waveInput" placeholder="Your message" />
        <div className="waveInputCounterWrapper">
          <p>0</p>
          <p> / 280</p>
        </div>
        <button className="waveButton">
          Send
        </button>
        {currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="waveMessageContainer">
          <div className="waveMessage">
            <p>{displayAddress('0xE623b99C1E950c4ecE895050648De5EF802b3773')}</p>
            <p>"Smooth UI"</p>
            <p>22/09/2021, 08:04:19</p>
          </div>
          <div className="waveMessage">
            <p>{displayAddress('0xE623b99C1E950c4ecE895050648De5EF802b3773')}</p>
            <p>"Smooth UI"</p>
            <p>22/09/2021, 08:04:19</p>
          </div>
          <div className="waveMessage">
            <p>{displayAddress('0xE623b99C1E950c4ecE895050648De5EF802b3773')}</p>
            <p>"Smooth UI"</p>
            <p>22/09/2021, 08:04:19</p>
          </div>
          <div className="waveMessage">
            <p>{displayAddress('0xE623b99C1E950c4ecE895050648De5EF802b3773')}</p>
            <p>"Smooth UI"</p>
            <p>22/09/2021, 08:04:19</p>
          </div>
        </div>
        {/* {allWaves.map((wave, index) => {
          return (
            <div style={{backgroundColor: "OldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })} */}
      </div>
    </div>
  );
}
