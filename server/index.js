const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

const passwords = {};
const balances = {
  "0x000000000000000000000000000000000000dEaD": 0,
};
const publicKeys = {};
const privateKeys = {};
const nonces = {}

// Endpoint for automatically generating wallet & saving with user password
app.post("/createWallet", (req, res) => {
  const { passwordHash, privateKey, publicKey, address } = req.body;
  passwords[address] = passwordHash;
  balances[address] = 50;
  publicKeys[address] = publicKey;
  privateKeys[address] = privateKey;
  nonces[address] = 0;
  res.sendStatus(200);
});

// If user enters correct password, send server data for easy wallet UX
app.post("/login", (req, res) => {
  const { address, passwordHash } = req.body;

  if (passwords[address] && passwords[address] === passwordHash) {
    res.status(200).json({ privateKey: privateKeys[address], balance: balances[address], nonce: nonces[address] });
  } else {
    res.status(401).json({ message: "Invalid address or password" });
  }
});

app.get("/addresses", (req, res) => {
  res.json(balances);
});

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

// Gauntlet of validation checks before transferring balances
app.post("/send", (req, res) => {
  const { sender, nonce, recipient, amount, signature, messageHash, recoveryBit } = req.body;

  // First a cheap and fast way to rebuff replay attacks before we get into hashing
  const expectedNonce = nonces[sender];
  if (nonce !== expectedNonce) {
    res.status(400).send({ message: "Invalid nonce "});
    return;
  }

  // Independently verify message hash
  const expectedMessage = `Send ${amount} to ${recipient} with nonce ${nonce}`;
  const expectedMessageHash = toHex(keccak256(utf8ToBytes(expectedMessage)));
  if (messageHash !== expectedMessageHash) {
    res.status(400).send({ message: "Invalid message hash "});
    return;
  }

  // Recover public key and compare to stored data
  const expectedPublicKey = publicKeys[sender];
  const recoveredPublicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit);
  if (toHex(recoveredPublicKey) !== expectedPublicKey) {
    res.status(400).send({ message: "Invalid signature "});
    return;
  }

  // Finally, check to see if sender has enough balance for transaction
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Insufficient funds" });
  } else {
    nonces[sender] += 1;
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});