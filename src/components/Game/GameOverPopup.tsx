import React, { useState, useEffect } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import { ABI } from "@/abis/abi";
import "../../styles/globals.css";
interface GameOverPopupProps {
  score: number;
  onRestart: () => void;
  tweetContent?: string | null;
  contractAddress?: string;
}

const GameOverPopup: React.FC<GameOverPopupProps> = ({
  score,
  onRestart,
  tweetContent,
  contractAddress,
}) => {
  const [scoreSaved, setScoreSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState<string | null>(null);
  const { address, account, status } = useAccount();

  // Use the useContract hook instead of manually creating the contract
  const { contract: contractFromHook } = useContract({
    address: contractAddress as `0x${string}` | undefined,
    abi: ABI,
  });

  // Function to save score to contract
  const handleSaveScore = async () => {
    if (!address || !account) {
    }

    if (scoreSaved) return;

    try {
      setIsSubmitting(true);
      setSaveError(null);

      // Check if wallet is connected
      if (!address || !account) {
        console.log("Wallet status:", status);
        setSaveError("Please connect your wallet to save your score");
        setIsSubmitting(false);
        return;
      }

      if (!contractAddress) {
        setSaveError("Cannot connect to contract");
        setIsSubmitting(false);
        return;
      }

      setSignatureStatus("Preparing transaction...");

      // Get current timestamp
      const timestamp = Math.floor(Date.now() / 1000);

      setSignatureStatus("Sending transaction to your wallet...");

      // Send the transaction using the connected account
      try {
        console.log("Submitting score with values:", {
          address,
          score,
          timestamp,
        });

        // Convert hex address to decimal format
        const decimalAddress = BigInt(address).toString(10);

        console.log("Address in decimal format:", decimalAddress);

        // Format calldata in the correct format for StarkNet
        const result = await account.execute({
          contractAddress:
            "0x61f7a7802c2a5bddcaf22bd437d2271204cd75a9da6793d5ff50bfb9ad50d18",
          entrypoint: "submit_score",
          calldata: [
            decimalAddress, // Address in decimal format
            score.toString(10), // Convert score to decimal string
            timestamp.toString(10), // Convert timestamp to decimal string
          ],
        });

        console.log("Transaction sent:", result);
        setSignatureStatus("Transaction sent! Waiting for confirmation...");

        // Wait for transaction confirmation
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setSignatureStatus(null);
        setScoreSaved(true);
      } catch (txError) {
        console.error("Transaction error details:", txError);
        // Type guard to check if txError is an object with a message property
        if (
          typeof txError === "object" &&
          txError !== null &&
          "message" in txError
        ) {
          const errorMessage = (txError as { message: string }).message;
          if (errorMessage.includes("User abort")) {
            throw new Error("User aborted the transaction");
          } else {
            throw new Error(`Transaction error: ${errorMessage || "Unknown"}`);
          }
        } else {
          throw new Error("Transaction error: Unknown");
        }
      }
    } catch (error) {
      console.error("Error saving score:", error);
      setSignatureStatus(null);
      if (error instanceof Error) {
        setSaveError(
          error.message || "Could not save score to contract. Please try again."
        );
      } else {
        setSaveError("Could not save score to contract. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to handle the restart button click
  // Updated handleRestartClick function
  const handleRestartClick = () => {
    // Reset all local states
    setScoreSaved(false);
    setSaveError(null);
    setIsSubmitting(false);
    setSignatureStatus(null);

    // Call the parent's onRestart function
    onRestart();

    // Force a re-render by adding a small delay
    setTimeout(() => {
      window.location.reload(); // This will refresh the page and restart everything
    }, 100);
  };

  // Return statement with updated UI
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-90">
      <div className="bg-[#00011A] p-8 rounded-lg max-w-md w-full text-center">
        <h2 className="text-red-500 text-4xl font-bold mb-6 font-pixel animate-pulse">
          GAME OVER!
        </h2>

        <div className="mb-6">
          <p className="text-white text-2xl mb-2 font-pixel">Your Score:</p>
          <p className="text-white text-5xl font-pixel">{score}</p>
        </div>

        {contractAddress && (
          <div className="mb-6">
            {scoreSaved ? (
              <p className="text-white mb-4 font-pixel">
                Score saved to contract!
              </p>
            ) : signatureStatus ? (
              <div className="mb-4">
                <div className="flex items-center justify-center mb-2">
                  <div className="animate-spin h-5 w-5 mr-3 border-2 border-white rounded-full border-t-transparent"></div>
                  <p className="text-white font-pixel">{signatureStatus}</p>
                </div>
              </div>
            ) : saveError ? (
              <div className="mb-4">
                <p className="text-white mb-2 font-pixel">{saveError}</p>
                <button
                  onClick={handleSaveScore}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200 mb-4 font-pixel"
                  disabled={isSubmitting}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveScore}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200 mb-4 font-pixel"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Save Score to Contract"}
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleRestartClick}
          className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded text-xl transition-colors duration-200 font-pixel"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverPopup;
