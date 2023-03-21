import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";

export default function Transfer({
  address,
  setBalance,
  transactionCount,
  setTransactionCount,
  receiverAddress,
  setReceiverAddress,
  loggedInPrivateKey,
}) {
  const [sendAmount, setSendAmount] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // Function for auto-signing transaction in the transfer confirmation modal
  async function signAndSendTransaction() {
    const parsedAmount = parseInt(sendAmount)
    const message = `Send ${parsedAmount} to ${receiverAddress} with nonce ${transactionCount}`;
    const messageHash = keccak256(utf8ToBytes(message));

    const signature = await secp.sign(messageHash, loggedInPrivateKey, { recovered: true });
    const recoveryBit = signature[1];

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        nonce: transactionCount,
        amount: parsedAmount,
        recipient: receiverAddress,
        signature: toHex(signature[0]),
        recoveryBit: recoveryBit,
        messageHash: toHex(messageHash),
      });
      setBalance(balance);
      setTransactionCount((prevCount) => prevCount + 1);
    } catch (ex) {
      if (ex.response && ex.response.data && ex.response.data.message) {
        alert(ex.response.data.message);
      } else {
        console.error(ex);
        alert('An error occurred during the transaction process.');
      }
    }

    setShowConfirmModal(false);
  }

  function handleTransferSubmit(evt) {
    evt.preventDefault();
    setShowConfirmModal(true);
  }
  

  return (
    <>
      <form className="container transfer" onSubmit={handleTransferSubmit}>
        <h1>Send Transaction</h1>

        <label>
          Send Amount
          <input
            placeholder="1, 2, 3..."
            value={sendAmount}
            onChange={setValue(setSendAmount)}
          ></input>
        </label>

        <label>
          Recipient
          <input
            placeholder="Type an address, or select from the Address List below"
            value={receiverAddress}
            onChange={setValue(setReceiverAddress)}
          ></input>
        </label>

        <input type="submit" className="button" value="Transfer" />
      </form>

      {showConfirmModal && (
        <div className="modal">
          <h3>Confirm Transaction</h3>
          <p>
            Are you sure you want to send {sendAmount} ETH to{" "}
            {receiverAddress}?
          </p>
          <div className="modal-buttons">
            <button
              className="button"
              onClick={signAndSendTransaction}
            >
              Sign
            </button>
            <button
              className="button cancel"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}