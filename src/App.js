import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';
import { isCompositeComponentWithType } from "react-dom/test-utils";

export default function App() {
  // Just a state variable we use to store our user's public wallet address.
  const contractAddress = "0x99C08BD6e294b2424C24a3107aEEAf5Fdc06E723"
  const contractABI = abi.abi
 
  const [currAccount, setCurrentAccount] = React.useState("")
  const [totalWaves, setTotalWaves] = React.useState(0)
  const [allWaves, setAllWaves] = React.useState([])
  
  const messageLimit = 280
  const [message, setMessage] = React.useState("")
  const [status, setStatus] = React.useState("")
  const [isButtonDisabled, setIsButtonDisabled] = React.useState(true)

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
        // console.log("Found an authorized account: ", account);

        // Store the users public wallet address for later!
        setCurrentAccount(account);
        
        // Load waves
        getAllWaves()
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

    setIsButtonDisabled(true);
    setMessage("")

    let count = await waveportalContract.getTotalWaves()
    setTotalWaves(count.toNumber())

    const waveTxn = await waveportalContract.wave(message, { gasLimit: 300000 })
    console.log("Mining....", waveTxn.hash)
    setStatus("Mining")
    await waveTxn.wait()
    console.log("Mined --", waveTxn.hash)

    count = await waveportalContract.getTotalWaves()
    setTotalWaves(count.toNumber())

    setStatus("")
  }

  const getAllWaves = async () => {
    try {
      if (window.ethereum) {
        console.log('GET ALL WAVES');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let waves = await wavePortalContract.getAllWaves()
        let wavesCleaned = []
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000).toLocaleString(),
            message: wave.message
          })
        })
        wavesCleaned = wavesCleaned.reverse()
        setAllWaves(wavesCleaned);

        // Listen for emitter events!
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("New Wave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000).toLocaleString(),
            message: message
          }]);
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const displayAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}`
  }

  const handleInput = React.useCallback((e) => {
    setMessage(e.target.value)
    if (e.target.value.length > 0 && e.target.value.length <= messageLimit) {
      setIsButtonDisabled(false)
    } else {
      setIsButtonDisabled(true)
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
          disabled={currAccount.length > 0 ? false : true}
          onChange={handleInput}
          value={message}
        />
        <div className="waveInputCounterWrapper">
          <p>{message.length}</p>
          <p>/ {messageLimit}</p>
        </div>
        <div className="row">
          {currAccount ? (
            <button className="waveButton" disabled={isButtonDisabled} onClick={wave}>
              Send
            </button>) : (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
          <p>{status}</p>
        </div>
        <div className="waveMessageContainer">
          {allWaves.map((wave, index) => {
            return (
              <div key={index} className="waveMessage">
                <p>{displayAddress(wave.address)}</p>
                <p>{wave.message}</p>
                <p>{wave.timestamp.toString()}</p>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
