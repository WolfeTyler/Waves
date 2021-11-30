import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json"

export default function App() {
  const [currAccount, setCurrAccount] = React.useState("");
    const contractAddress = "0x9f356746Aa933cC2e68a2E617cBf0061c3D5b9b4";
  const contractABI = abi.abi;

  const [allWaves, setAllWaves] = React.useState([]);
  const [message, setMessage] = React.useState([]);

  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum){
      console.log("Make sure you have metamask")
      return;
    } else {
      console.log("We have an ethereum object", ethereum)
    }

    ethereum.request({ method: 'eth_accounts'})
      .then(accounts => {
        if (accounts.length !== 0){
          const account = accounts[0];
          console.log("Found an authorized account:", account)
          setCurrAccount(account);
          getAllWaves()
        } else {
          console.log("No authorised account found")
        }
      })
  }

  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum){
      alert("Get Metamask wallet")
    }
    ethereum.request({method: 'eth_requestAccounts'})
    .then(accounts => {
      console.log("ethereum wallet connected: ", accounts[0])
      setCurrAccount(accounts[0])
      getAllWaves()
    })
    .catch(err => console.log(err))
  }

  React.useEffect(() => {
      checkIfWalletIsConnected();
    }, [])

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI, signer);
    let waves = await wavePortalContract.getAllWaves();

    let wavesCleaned = []
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })
    console.log(wavesCleaned);
    setAllWaves(wavesCleaned)

    wavePortalContract.on("NewWave", (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message)
      setAllWaves(oldArray => [...oldArray, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }])
    })
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves();
    console.log("Retrieved total wave count...", count.toNumber());

    const waveTxn = await waveportalContract.wave(message, { gasLimit: 300000 });
    
    console.log("Mining...", waveTxn.hash);
    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash);
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        👋 Ciao from Ethereum!
        </div>

        <div className="bio">
        Hi, I'm Tyler! Connect your Ethereum wallet and send me a message on the blockchain with what you'd like to learn while we explore the decentralized web together.
        </div>
        
        <div className="bio">
        If you don't yet have a wallet, I've created an easy guide to setup MetaMask <a href="https://notioblock.com/2021/05/12/creating-a-crypto-wallet-with-metamask/" target="_blank">here</a>.
        </div>

        <textarea 
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          style={{marginTop: "10px"}}
        />

        <button className="waveButton" onClick={wave}>
          Send a message
        </button>

        {currAccount ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          console.log(wave);
          return (
            <div style={{backgroundColor: "pink", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}