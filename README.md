# MetaBattles

A space-themed blockchain game built with Next.js and Starknet integration.

![MetaBattles](https://gold-imperial-tuna-683.mypinata.cloud/ipfs/bafybeiduthswcljjfzcjosgbghnrwhblbeiyypi6adtonjaltjcc33yyxq)

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher) for Twitter integration
- Starknet wallet (for leaderboard functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd web
   ```
2. Install dependencies:
   npm install
3. Set up Python environment and install requirements for Twitter integration:
   pip install tweepy flask python-dotenv
4. Create a .env file in the scripts directory with your Twitter API credentials
   TWITTER_BEARER_TOKEN=your_bearer_token
   TWITTER_CONSUMER_KEY=your_consumer_key
   TWITTER_CONSUMER_SECRET=your_consumer_secret
   TWITTER_ACCESS_TOKEN=your_access_token
   TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret

#Running the Application

1. Start the development server:
   npm run dev
   This will start both the Next.js application and the Twitter API server.
2. Open your browser and navigate to http://localhost:3000 to play the game.

## Technologies Used

- Frontend : Next.js, React, TypeScript, Tailwind CSS
- Game Engine : Custom built with Canvas API
- Blockchain : Starknet.js for smart contract interaction
- Backend : Flask (Python) for Twitter integration
- APIs : Twitter API for social sharing

## Smart Contract Integration

The game integrates with Starknet smart contracts to store and retrieve player scores. The leaderboard component displays the top players based on their scores stored on the blockchain.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
