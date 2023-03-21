
export default function Wallet({ address, setAddress, setLoggedIn, setLoggedInPrivateKey, balance, setBalance }) {

  function handleLogOut() {
    setAddress("");
    setLoggedInPrivateKey("");
    setLoggedIn(false);
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input disabled value={address}></input>
      </label>

      <div className="balance">Balance: {balance}</div>
      <button className="button cancel" onClick={handleLogOut}>Log Out</button>
    </div>
  );
}