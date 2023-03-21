import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import axios from "axios";
import server from "./server";

export default function Login({ setLoggedIn, setLoggedInPrivateKey, setTransactionCount, setBalance, setAddress }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [createdAddress, setCreatedAddress] = useState("");
  const [createdPublicKey, setCreatedPublicKey] = useState("");
  const [createdPrivateKey, setCreatedPrivateKey] = useState("");

  // User can login to existing wallet using password 
  const handleLogin = async () => {
    const passwordHash = keccak256(utf8ToBytes(password));
  
    try {
      const response = await server.post(`/login`, {
        address: inputAddress,
        passwordHash: toHex(passwordHash),
      });
  
      // Successful login sets state variables for smooth wallet UX
      setLoggedInPrivateKey(response.data.privateKey);
      setLoggedIn(true);
      setAddress(inputAddress);
      setBalance(response.data.balance);
      setTransactionCount(response.data.nonce);
      setShowLoginModal(false);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setAlertMessage("Invalid address or password");
      } else {
        console.error("Error during login", error);
        setAlertMessage("Error during login, please try again");
      }
    }
  };

  // After user chooses wallet password, generate keys and address, and send data to server
  const generateWallet = async () => {
    if (password === "") {
      setAlertMessage("Enter a password");
      return;
    }

    if (password !== confirmPassword) {
      setAlertMessage("Passwords do not match");
      return;
    }

    const passwordHash = keccak256(utf8ToBytes(password));
    const privateKey = secp.utils.randomPrivateKey();
    const publicKey = secp.getPublicKey(privateKey);
    const khash = keccak256(publicKey.slice(1));
    const address = khash.slice(-20);

    const hexPasswordHash = toHex(passwordHash);
    const hexPrivateKey = toHex(privateKey);
    const hexPublicKey = toHex(publicKey);
    const hexAddress = toHex(address);

    try {
      const response = await server.post(`/createWallet`, {
        passwordHash: hexPasswordHash,
        address: hexAddress,
        publicKey: hexPublicKey,
        privateKey: hexPrivateKey,
      });

      setCreatedPrivateKey(hexPrivateKey);
      setCreatedPublicKey(hexPublicKey);
      setCreatedAddress(hexAddress);
      setPassword("");
      setConfirmPassword("");
      setBalance(response.data.balance);
      setTransactionCount(response.data.nonce);
      setShowCreateWalletModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating wallet", error);
      setAlertMessage("Error creating wallet, please refresh and try again");
    }
  };

  // Dismiss modal and reset state variables if user clicks Cancel
  function dismiss() {
    setShowLoginModal(false);
    setShowCreateWalletModal(false);
    setAddress("");
    setInputAddress("");
    setAlertMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  // Dismiss modal and log user in with new wallet, set state variables to default new wallet values
  function confirm() {
    setLoggedInPrivateKey(createdPrivateKey);
    setAddress(createdAddress);
    setTransactionCount(0);
    setBalance(50);
    setLoggedIn(true);
    setShowSuccessModal(false);
  }

  return (
    <>
      <div className="modal">
        <button
          className="button"
          onClick={() => {
            setShowLoginModal(true);
          }}
        >
          Log in
        </button>
        <button
          className="button"
          onClick={() => {
            setShowCreateWalletModal(true);
          }}
        >
          Create Wallet
        </button>
      </div>

      {showLoginModal && (
        <div className="modal">
          <h3>Log In</h3>
          <div>
            <label>Address:</label>
            <input
              type="text"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="alert">{alertMessage}</div>
          <div className="modal-buttons">
            <button className="button" onClick={handleLogin}>
              Log In
            </button>
            <button className="button cancel" onClick={dismiss}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for creating a new wallet with user-chosen password */}

      {showCreateWalletModal && (
        <div className="modal">
          <h3>Create New Wallet</h3>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="alert">{alertMessage}</div>
          <div className="modal-buttons">
            <button className="button" onClick={generateWallet}>
              Create
            </button>
            <button className="button cancel" onClick={dismiss}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for displaying keys after generation */}

      {showSuccessModal && (
        <div className="modal">
          <h3>Success!</h3>
          <div>
            <label>Address:</label>
            <div className="success-input">
              <input
                className="key-field"
                type="text"
                readOnly
                value={createdAddress}
              />
              <button
                onClick={() => navigator.clipboard.writeText(createdAddress)}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label>Public Key:</label>
            <div className="success-input">
              <input
                className="key-field"
                type="text"
                readOnly
                value={createdPublicKey}
              />
              <button
                onClick={() => navigator.clipboard.writeText(createdPublicKey)}
              >
                Copy
              </button>
            </div>
          </div>
          <div>
            <label>Private Key:</label>
            <div className="success-input">
              <input
                className="key-field"
                type="text"
                readOnly
                value={createdPrivateKey}
              />
              <button
                onClick={() => navigator.clipboard.writeText(createdPrivateKey)}
              >
                Copy
              </button>
            </div>
          </div>
          <div className="confirm-message">
            <p>
                Be sure to store these somewhere safe and never share them with
                anyone
            </p>
            <p>
                (Just kidding! They're stored in plaintext on the
                server. If you lose them, you can find them there.)
            </p>
          </div>
          <div className="modal-buttons">
            <button
              className="button"
              onClick={confirm}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  );
}