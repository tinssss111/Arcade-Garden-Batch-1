import { ABI } from "@/abis/abitop";
import { RpcProvider, Contract } from "starknet";

const provider = new RpcProvider({
    nodeUrl:
        "https://starknet-sepolia.infura.io/v3/160e0bcb838e4995a933c1814a399d59",
});

export const checkAccountDeployment = async (userAddress: string) => {
    try {
        const classHash = await provider.getClassHashAt(userAddress);
        return !!classHash;
    } catch {
        return false;
    }
};

const TOKENS = [
    {
        name: "STRK",
        address:
            "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        decimals: 18,
    },
    {
        name: "ETH",
        address:
            "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
        decimals: 18,
    },
];

const ERC20_ABI = [
    {
        name: "balanceOf",
        type: "function",
        inputs: [{ name: "account", type: "felt" }],
        outputs: [{ name: "balance", type: "felt" }],
        stateMutability: "view",
    },
];

export const fetchTokenBalances = async (userAddress: string) => {
    try {
        const results = await Promise.allSettled(
            TOKENS.map(async (token) => {
                const contract = new Contract(ERC20_ABI, token.address, provider);
                const balanceResult = await contract.call("balanceOf", [userAddress]);

                if (typeof balanceResult === "object" && balanceResult !== null && "balance" in balanceResult) {
                    const rawBalance = balanceResult.balance;
                    const balance = BigInt(rawBalance.toString() || "0");
                    return {
                        name: token.name,
                        balance: (Number(balance) / 10 ** token.decimals).toFixed(6),
                    };
                } else {
                    console.warn(`BalanceResult không hợp lệ cho token ${token.name}:`, balanceResult);
                    return null;
                }

            })
        );

        return results
            .filter((r) => r.status === "fulfilled" && r.value !== null)
            .map((r) => (r as PromiseFulfilledResult<{ name: string; balance: string }>).value);
    } catch (error) {
        console.error("Error fetching token balances:", error);
        return [];
    }
};

export const fetchTopPlayers = async (contractAddress: string, count: number) => {
    try {
        const contract = new Contract(ABI, contractAddress, provider);
        const result = await contract.call('get_top_players', [count]);

        if (result && Array.isArray(result) && result.length === 2) {
            const [addresses, scores] = result;
            return addresses.map((address: any, index: string | number) => ({
                address,
                score: Number(scores[index])
            }));
        }
        throw new Error('Invalid response format from contract');
    } catch (error) {
        console.error('Error fetching top players:', error);
        throw error;
    }
};
