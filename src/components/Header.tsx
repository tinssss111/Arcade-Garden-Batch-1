"use client";
import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "@starknet-react/core";
import dynamic from "next/dynamic";
import {
  checkAccountDeployment,
  fetchTokenBalances,
} from "../lib/starknetUtils";

const WalletBar = dynamic(() => import("./WalletBar"), { ssr: false });

const Header: FC = () => {
  const { address: userAddress } = useAccount();
  const [tokenBalances, setTokenBalances] = useState<
    { name: string; balance: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!userAddress) {
      setIsDeployed(null);
      setTokenBalances([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [deployed, tokens] = await Promise.all([
          checkAccountDeployment(userAddress),
          fetchTokenBalances(userAddress),
        ]);

        setIsDeployed(deployed);
        setTokenBalances(tokens);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userAddress]);

  return (
    <header className="flex justify-center items-center w-full py-4 mt-[300px]">
      <div className="flex flex-col items-center max-w-4xl w-full">
        {userAddress && (
          <div className="text-sm font-medium text-gray-700 flex flex-col items-center gap-3 mb-3">
            {isDeployed === false && (
              <p className="text-red-500 text-[10px] font-mono">
                Wallet Not Deployed
              </p>
            )}
          </div>
        )}
        <WalletBar />
      </div>
    </header>
  );
};

export default Header;
