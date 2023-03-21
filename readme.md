## Wallet UX Mockup

This is my version of the ECDSA Node project for Alchemy University. 

I focused on UX, so that users can generate new password-protected wallets at the click of a button, and easily sign transactions without any copy-pasting of strings. As a result, it's incredibly insecure, with both the client and server storing and transferring private keys in plaintext. But the goal of the project was to implement the signature and verification process, which I think works nicely.

### Login/Create Wallet

The initial splash screen is a login modal, with the ability to create a new wallet. Creating a new wallet generates keys and addresses, and stores the user's password hash for login validation in the future. Users can log in to an existing wallet with their address and password, once they have been generated.

### Sending Transactions

Local state variables in the client store the logged in user's private key, so that signing transactions is effortless. I wanted to loosely emulate the ease-of-use of browser wallets like Metamask. I may revisit this project to implement secure key management, but I considered that out of scope for now.

### Address list

A major part of the UX is a component called AddressList, located beneath the Wallet and Transaction components. It displays all existing addresses and their balance, and allows users to choose an address to send a transaction to, simply by clicking on it.
