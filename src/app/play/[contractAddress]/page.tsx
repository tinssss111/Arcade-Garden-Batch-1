"use client";
import { FC } from "react";
import Game from "@/components/Game/Game";
import { useParams } from "next/navigation";

const PlayPage: FC = () => {
  const params = useParams() ?? {};
  const contractAddress = params.contractAddress as string;
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   // Wait for wallet connection to be established
  //   const checkWalletConnection = () => {
  //     if (address === undefined) {
  //       return;
  //     }

  //     setIsLoading(false);

  //     if (!address || address !== contractAddress) {
  //       console.log("Redirecting to home:", { address, contractAddress });
  //       router.push("/");
  //     }
  //   };

  //   checkWalletConnection();
  // }, [address, contractAddress, router]);

  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
  //       <p className="text-gray-600">Loading...</p>
  //     </div>
  //   );
  // }

  // if (!address || address !== contractAddress) {
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Game contractAddress={contractAddress} />
    </div>
  );
};

export default PlayPage;
