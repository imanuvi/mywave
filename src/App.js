import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

export default function App() {
  // Just a state variable we use to store our user's public wallet address.
  const contractAddress = "0x99C08BD6e294b2424C24a3107aEEAf5Fdc06E723"
  const contractABI = abi.abi
 
  const [currAccount, setCurrentAccount] = React.useState("")
  const [totalWaves, setTotalWaves] = React.useState(0)
  const [allWaves, setAllWaves] = React.useState([])
  
  const messageLimit = 280
  const [message, setMessage] = React.useState("")
  const [isButtonDisabled, setisButtonDisabled] = React.useState(true)

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
    console.log(`Current Account: ${currAccount}`)
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

  const handleInput = React.useCallback((e) => {
    setMessage(e.target.value)
    console.log(message)
    // console.log(message, message.length, messageLimit)
    if (message.length > 0 && message.length <= messageLimit) {
      setisButtonDisabled(false)
    } else {
      setisButtonDisabled(true)
    }
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Wave the block
        </div>
        <div className="bio">
          Send me a public message on the blockchain and there is a 50% chance to win some ETH!
        </div>
        <textarea 
          className="waveInput"
          placeholder="Your message"
          disabled={currAccount.lengthy > 0 ? false : true}
          onChange={handleInput}
          value={message}
        />
        <div className="waveInputCounterWrapper">
          <p>{message.length}</p>
          <p>/ {messageLimit}</p>
        </div>
        {currAccount ? (
          <button className="waveButton" disabled={isButtonDisabled}>
            Send
          </button>) : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="waveMessageContainer">
          {allWaves.map((wave, index) => {
            <div className="waveMessage">
              <p>{displayAddress(wave.address)}</p>
              <p>{wave.message}</p>
              <p>{wave.timestamp.toString()}</p>
            </div>
          })}
          {/* <div className="waveMessage">
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
          </div> */}
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
