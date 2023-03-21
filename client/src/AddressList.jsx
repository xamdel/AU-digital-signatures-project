import { useState, useEffect } from "react";
import axios from "axios";

export default function AddressList({ transactionCount, onAddressClick }) {
  const [addresses, setAddresses] = useState({});

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get("http://localhost:3042/addresses");
        setAddresses(response.data);
      } catch (error) {
        console.error("Error fetching addresses", error);
      }
    };

    fetchAddresses();
  }, [transactionCount]);

  const handleAddressClick = (address) => {
    onAddressClick(address);
  };

  return (
    <div className="container">
      <h2>Address List</h2>
      <table className="address-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(addresses).map(([address, balance]) => (
            <tr key={address}>
              <td>
                <span
                  className="address-text"
                  onClick={() => onAddressClick(address)}
                >
                  {address}
                </span>
              </td>
              <td>{balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
