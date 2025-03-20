/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import {
  useConnect,
  useDisconnect,
  useAccount,
  useNetwork,
} from "@starknet-react/core";
import { Copy, Check, QrCode, ExternalLink, LogOut } from "lucide-react";
import { BlockieAvatar } from "./ui/BlockieAvatar";

const WalletBar: React.FC = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Tự động kết nối lại nếu có thông tin ví trong localStorage
  useEffect(() => {
    const savedConnectorId = localStorage.getItem("selectedConnector");
    if (!address && savedConnectorId) {
      const savedConnector = connectors.find((c) => c.id === savedConnectorId);
      if (savedConnector) connect({ connector: savedConnector });
    }
  }, [address, connectors, connect]);

  const handleConnect = async (connector: any) => {
    await connect({ connector });
    localStorage.setItem("selectedConnector", connector.id);
    setShowModal(false);
  };

  const handleDisconnect = async () => {
    await disconnect();
    localStorage.removeItem("selectedConnector");
    setShowDropdown(false);
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    }
  };

  return (
    <div className="relative flex items-center">
      {!address ? (
        <>
          <button
            onClick={() => setShowModal(true)}
            className="border border-black text-black font-medium py-2 px-4 bg-yellow-300 hover:bg-yellow-500 rounded-md"
          >
            Connect Wallet
          </button>

          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-[50px] rounded-md shadow-lg">
                <h2 className="mb-6 text-center text-lg font-bold">
                  Choose Wallet
                </h2>
                <div className="flex flex-col space-y-2">
                  {connectors.map((connector) => {
                    // Lấy logo của từng ví
                    const getWalletLogo = (id: string) => {
                      if (id.includes("braavos"))
                        return "https://media.licdn.com/dms/image/v2/D4D0BAQGewt1oT4SLtg/company-logo_200_200/company-logo_200_200/0/1734268017966/braavos_web3_logo?e=2147483647&v=beta&t=RMAoMCop8zNTWK8uJmRT6JvmyK7sYo7cM3XGylxcL3s";
                      if (id.includes("argent"))
                        return "https://play-lh.googleusercontent.com/P-xt-cfYUtwVQ3YsNb5yd5_6MzCHmcKAbRkt-up8Ga44x_OCGLy4WFxsGhxfJaSLEw=w480-h960-rw"; // Placeholder nếu không có logo
                      if (id.includes("okx"))
                        return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Logo-OKX.png/768px-Logo-OKX.png";
                    };

                    return (
                      <button
                        key={connector.id}
                        onClick={() => handleConnect(connector)}
                        className="flex mb-2 items-center pr-[130px] pl-[15px] space-x-3 border border-black text-black font-medium py-2 bg-white rounded-md"
                      >
                        {/* Hiển thị logo */}
                        <img
                          src={getWalletLogo(connector.id)}
                          alt={`${connector.id} logo`}
                          className="w-[35px] h-[35px]"
                        />
                        {/* Hiển thị tên ví */}
                        <span className="capitalize font-mono">
                          {connector.id}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-center">
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-4 border border-gray-500 text-gray-500 font-medium py-2 px-[100px] rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 mr-[10px] border border-gray-400 px-4 py-[5px] rounded-full bg-blue-900 text-white hover:bg-blue-800 transition"
          >
            <BlockieAvatar address={address} size={32} />
            <div className="flex flex-col font-mono">
              <span className="text-sm font-medium">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <span className="text-xs mr-[50px] text-white capitalize">
                {chain?.network || "Unknown Network"}
              </span>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              <ul className="">
                <li
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer font-mono"
                  onClick={handleCopy}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  Copy address
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer font-mono">
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR Code
                </li>
                <li className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer font-mono">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <a
                    href={`https://starkscan.co/contract/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Explorer
                  </a>
                </li>
                <li
                  className="flex items-center px-4 py-2 hover:bg-red-100 text-red-500 cursor-pointer font-mono"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletBar;
