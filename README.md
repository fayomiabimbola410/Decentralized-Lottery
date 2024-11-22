# Decentralized Lottery System

This project implements a transparent and provably fair lottery system using Clarity smart contracts on the Stacks blockchain. It features automated ticket purchases, random number generation based on block height, and prize distribution.

## Features

- Start and end lotteries with configurable durations
- Automated ticket purchases
- Transparent prize distribution
- Comprehensive test suite using Vitest

## Smart Contract Functions

1. \`start-lottery\`: Start a new lottery (owner only)
2. \`buy-ticket\`: Purchase a lottery ticket
3. \`end-lottery\`: End the current lottery and distribute the prize (owner only)
4. \`get-ticket-price\`: Get the current ticket price
5. \`get-ticket-owner\`: Get the owner of a specific ticket
6. \`get-lottery-balance\`: Get the current prize pool balance
7. \`get-lottery-status\`: Get the current status of the lottery
8. \`get-winner\`: Get the winner of the most recent lottery

## Random Number Generation

The lottery uses the current block height modulo the total number of tickets to determine the winning ticket. This method ensures fairness and unpredictability.

## Usage

To interact with this smart contract, you'll need to use a Stacks wallet and a compatible dApp. Here's a general workflow:

1. Deploy the smart contract to the Stacks blockchain
2. The contract owner starts a new lottery using \`start-lottery\`
3. Users purchase tickets using \`buy-ticket\`
4. Once the lottery duration has passed, the owner ends the lottery using \`end-lottery\`
5. The winner is automatically selected and the prize is distributed

## Development

This project is developed using Clarity, the smart contract language for the Stacks blockchain. To set up a development environment, follow these steps:

1. Install [Clarinet](https://github.com/hirosystems/clarinet)
2. Clone this repository
3. Run \`clarinet check\` to verify the contract
4. Run \`clarinet test\` to execute the Clarity test suite

## Testing

The project includes a comprehensive test suite using Vitest. To run the tests:

1. Ensure you have Node.js installed
2. Install dependencies: \`npm install\` or \`yarn install\`
3. Run tests: \`npm test\` or \`yarn test\`

## Security Considerations

- The random number generation relies on block height, which could potentially be manipulated by miners. For high-value lotteries, consider implementing additional sources of randomness.
- Ensure that only the contract owner can start and end lotteries.
- Implement additional checks to prevent potential exploits, such as limiting the number of tickets a single address can purchase.

## Future Improvements

- Implement a multi-draw lottery system
- Add time-based automatic lottery endings
- Integrate with an oracle for enhanced randomness
- Implement a token system for lottery participation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
