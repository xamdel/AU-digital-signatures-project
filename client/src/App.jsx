import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState, useEffect } from "react";
import Login from "./Login";
import AddressList from "./AddressList";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loggedInPrivateKey, setLoggedInPrivateKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [transactionCount, setTransactionCount] = useState(0);

  return (
    <div className="app">
      {!loggedIn ? (
        <Login
          setLoggedIn={setLoggedIn}
          setLoggedInPrivateKey={setLoggedInPrivateKey}
          setBalance={setBalance}
          setAddress={setAddress}
          setTransactionCount={setTransactionCount}
        />
      ) : (
        <>
          <div className="dashboard">
            <Wallet
              balance={balance}
              setBalance={setBalance}
              address={address}
              setAddress={setAddress}
              setLoggedInPrivateKey={setLoggedInPrivateKey}
              setLoggedIn={setLoggedIn}
            />
            <Transfer
              setBalance={setBalance}
              address={address}
              transactionCount={transactionCount}
              setTransactionCount={setTransactionCount}
              receiverAddress={receiverAddress}
              setReceiverAddress={setReceiverAddress}
              loggedInPrivateKey={loggedInPrivateKey}
            />
          </div>
          <div className="address-list-container">
            <AddressList
              transactionCount={transactionCount}
              onAddressClick={setReceiverAddress}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
