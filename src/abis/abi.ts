export const ABI = [
  {
    "type": "interface",
    "name": "space_invaders_game::ISpaceInvadersGame",
    "items": [
      {
        "type": "function",
        "name": "submit_score",
        "inputs": [
          {
            "name": "player",
            "type": "core::starknet::contract_address::ContractAddress"
          },
          {
            "name": "score",
            "type": "core::integer::u32"
          },
          {
            "name": "timestamp",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_player_score",
        "inputs": [
          {
            "name": "player",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::integer::u32"
          }
        ],
        "state_mutability": "view"
      },
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
    ]
  },
] as const;