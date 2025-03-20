export const ABI = [
    {
        "type": "function",
        "name": "get_top_players",
        "inputs": [
            {
                "name": "n",
                "type": "core::integer::u32"
            }
        ],
        "outputs": [
            {
                "type": "(core::array::Array::<core::starknet::contract_address::ContractAddress>, core::array::Array::<core::integer::u32>)"
            }
        ],
        "state_mutability": "view"
    }
] as const;