import React, { useState, useEffect } from "react";
import { Contract, RpcProvider } from "starknet";
import { ABI } from "@/abis/abitop";
import "../../styles/globals.css";
import { shortenAddress } from "@/lib/utils";

interface LeaderboardEntry {
  address: string;
  score: number;
}

interface LeaderboardProps {
  contractAddress?: string;
  nodeUrl?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  contractAddress = "0x061f7a7802c2a5bddcaf22bd437d2271204cd75a9da6793d5ff50bfb9ad50d18",
  nodeUrl = "https://starknet-sepolia.infura.io/v3/160e0bcb838e4995a933c1814a399d59",
}) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(10);

  // Function to fetch leaderboard data
  const fetchLeaderboardData = async () => {
    if (!contractAddress) {
      setError("Contract address not provided");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Initialize provider with the node URL
      const provider = new RpcProvider({ nodeUrl });

      // Create a contract instance
      const contract = new Contract(ABI, contractAddress, provider);

      // Call the get_top_players function
      const result = await contract.get_top_players(numberOfPlayers);

      // Extract addresses and scores from the result
      const addresses = result[0];
      const scores = result[1];

      // Combine into LeaderboardEntry objects
      const formattedData: LeaderboardEntry[] = addresses.map(
        (address: any, index: number) => ({
          address: "0x" + BigInt(address).toString(16), // Chuyển sang dạng hex
          score: Number(scores[index]),
        })
      );

      setLeaderboardData(formattedData);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      setError(
        `Failed to load leaderboard data: ${error.message || String(error)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or when contract address changes
  useEffect(() => {
    fetchLeaderboardData();
  }, [contractAddress, nodeUrl, numberOfPlayers]);

  return (
    <div className="fixed top-4 right-4 flex items-center justify-center z-50 bg-black bg-opacity-90 rounded-lg shadow-lg">
      <div className="bg-[#00011A] p-4 rounded-lg max-w-xs w-full text-center">
        <h2 className="text-blue-500 text-2xl font-bold mb-4 font-pixel">
          LEADERBOARD
        </h2>

        <div className="mb-2">
          <label className="block text-white text-xs font-pixel mb-1">
            Number of players:
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={numberOfPlayers}
            onChange={(e) => setNumberOfPlayers(parseInt(e.target.value) || 1)}
            className="bg-gray-800 text-white px-2 py-1 rounded-md w-16 font-pixel text-xs"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center mb-4">
            <div className="animate-spin h-6 w-6 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
            <p className="text-white font-pixel text-xs">Loading...</p>
          </div>
        ) : error ? (
          <div className="mb-4">
            <p className="text-red-400 mb-2 font-pixel text-xs">{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-colors duration-200 font-pixel text-xs"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="mb-4 max-h-40 overflow-y-auto">
            {leaderboardData.length === 0 ? (
              <p className="text-white font-pixel text-xs">No scores yet!</p>
            ) : (
              <table className="w-full text-white text-xs">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="py-1 font-pixel text-left">#</th>
                    <th className="py-1 font-pixel text-left">Player</th>
                    <th className="py-1 font-pixel text-right">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((entry, index) => (
                    <tr
                      key={index}
                      className={
                        index === 0 ? "bg-yellow-900 bg-opacity-30" : ""
                      }
                    >
                      <td className="py-1 font-pixel text-left">{index + 1}</td>
                      <td className="py-1 font-pixel text-left">
                        {shortenAddress(entry.address)}
                      </td>
                      <td className="py-1 font-pixel text-right">
                        {entry.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
