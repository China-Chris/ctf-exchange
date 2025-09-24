# Polymarket CTF Exchange

[![Version][version-badge]][version-link]
[![License][license-badge]][license-link]
[![Test][ci-badge]][ci-link]

[version-badge]: https://img.shields.io/github/v/release/polymarket/ctf-exchange.svg?label=version
[version-link]: https://github.com/Polymarket/ctf-exchange/releases
[license-badge]: https://img.shields.io/github/license/polymarket/ctf-exchange
[license-link]: https://github.com/Polymarket/ctf-exchange/blob/main/LICENSE.md
[ci-badge]: https://github.com/Polymarket/ctf-exchange/actions/workflows/Tests.yml/badge.svg
[ci-link]: https://github.com/Polymarket/ctf-exchange/actions/workflows/Tests.yml

## Background

The Polymarket CTF Exchange is an exchange protocol that facilitates atomic swaps between [Conditional Tokens Framework(CTF)](https://docs.gnosis.io/conditionaltokens/) ERC1155 assets and an ERC20 collateral asset.

It is intended to be used in a hybrid-decentralized exchange model wherein there is an operator that provides offchain matching services while settlement happens on-chain, non-custodially.


## Documentation

- **Technical Docs**: [CTF Exchange Overview](./docs/Overview.md)
- **Business Guide**: [How to Use CTF Exchange](./BUSINESS_GUIDE.md) - 详细业务逻辑和使用场景
- **Trading Modes**: [Three Trading Modes Explained](./TRADING_MODES_EXPLAINED.md) - 三种交易模式详解
- **On-Chain Trading**: [Chain Trading Mechanism](./ON_CHAIN_TRADING.md) - 链上交易机制详解
- **Interaction Examples**: [Practical Examples](./INTERACTION_EXAMPLES.md) - 实际交互命令和示例
- **Deployment Summary**: [HashKey Testnet Deployment](./DEPLOYMENT_SUMMARY.md) - 部署状态和合约地址

## Audit

These contracts have been audited by Chainsecurity and the report is available [here](./audit/ChainSecurity_Polymarket_Exchange_audit.pdf).


## Deployments

| Network          | Address                                                                           |
| ---------------- | --------------------------------------------------------------------------------- |
| Polygon          | [0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E](https://polygonscan.com/address/0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E)|
| Amoy           | [0xdFE02Eb6733538f8Ea35D585af8DE5958AD99E40](https://amoy.polygonscan.com/address/0xdfe02eb6733538f8ea35d585af8de5958ad99e40)|
| **HashKey Testnet** | **0xF6Dc869Dc65065F605f5F9F9337b4beEC013Eb74** |

### HashKey Testnet Deployment Details

This project has been successfully deployed to HashKey testnet with the following configuration:

#### Network Information
- **RPC URL**: `https://testnet.hsk.xyz`
- **Chain ID**: `133`
- **Native Token**: HSK
- **Explorer**: [HashKey Testnet Explorer](https://testnet.hsk.xyz)

#### Deployed Contracts

| Contract Type | Address | Description |
|---------------|---------|-------------|
| **CTF Exchange** | `0xF6Dc869Dc65065F605f5F9F9337b4beEC013Eb74` | Main exchange contract |
| **USDC Mock** | `0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF` | Collateral token (USDC simulation) |
| **Conditional Tokens** | `0x86F6d77840B576F01f33C5D9db7c479E7baBfb1F` | CTF framework |
| **Proxy Factory** | `0x9643AA43149D386435B4D36195E9e00A6d346a31` | Polymarket proxy factory |
| **Safe Factory** | `0x87Df92bD4D799A402e020181332427A285fe9455` | Gnosis Safe factory |

#### Admin Configuration
- **Admin Address**: `0x319749f49C884a2F0141e53187dd1454E217786f`
- **Permissions**: Full admin and operator access

### Deployment Process

The deployment to HashKey testnet was completed using the following steps:

1. **Dependency Deployment**: First deployed simplified mock contracts for dependencies
2. **Main Contract Deployment**: Deployed the CTF Exchange with proper configuration
3. **Permission Setup**: Configured admin and operator permissions

#### Deployment Commands Used

```bash
# 1. Deploy dependencies
forge script src/exchange/scripts/SimpleDeploy.s.sol:SimpleDeploy \
    --rpc-url https://testnet.hsk.xyz \
    --broadcast \
    --private-key <PRIVATE_KEY> \
    -vvvv

# 2. Deploy main exchange
forge script src/exchange/scripts/HashKeyDeployment.s.sol:HashKeyDeployment \
    --rpc-url https://testnet.hsk.xyz \
    --broadcast \
    --private-key <PRIVATE_KEY> \
    -vvvv
```

### Usage on HashKey Testnet

#### Prerequisites
- HashKey testnet HSK tokens for gas fees
- Access to the deployed contracts
- Admin/operator permissions for configuration

#### Key Functions

1. **Register Tokens** (Admin only):
   ```solidity
   exchange.registerToken(tokenId, complementTokenId, conditionId);
   ```

2. **Create Orders**:
   ```solidity
   // Create buy/sell orders for conditional tokens
   ```

3. **Fill Orders** (Operator only):
   ```solidity
   exchange.fillOrder(order, fillAmount);
   ```

4. **Match Orders** (Operator only):
   ```solidity
   exchange.matchOrders(takerOrder, makerOrders, takerFillAmount, makerFillAmounts);
   ```

#### Testing the Deployment

You can interact with the deployed contracts using:

```bash
# Check contract state
cast call 0xeA76F564F38d881507A592508Dba3604D14949c6 "isAdmin(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url https://testnet.hsk.xyz

# Check collateral token balance
cast call 0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF "balanceOf(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url https://testnet.hsk.xyz
```

## Quick Start

### Prerequisites
- [Foundry](https://github.com/foundry-rs/foundry/) installed
- HashKey testnet HSK tokens for gas fees
- Private key with admin permissions

### Setup
1. Clone the repository
2. Install dependencies: `forge install`
3. Compile contracts: `forge build`
4. Run tests: `forge test`

### Deploy to HashKey Testnet
1. Configure your environment in `.env.hashkey`
2. Deploy dependencies: `forge script src/exchange/scripts/SimpleDeploy.s.sol:SimpleDeploy --rpc-url https://testnet.hsk.xyz --broadcast --private-key <YOUR_PRIVATE_KEY>`
3. Deploy main exchange: `forge script src/exchange/scripts/HashKeyDeployment.s.sol:HashKeyDeployment --rpc-url https://testnet.hsk.xyz --broadcast --private-key <YOUR_PRIVATE_KEY>`

## Development

Install [Foundry](https://github.com/foundry-rs/foundry/).

Foundry has daily updates, run `foundryup` to update `forge` and `cast`.

---

## Testing

To run all tests: `forge test`

To run test functions matching a regex pattern `forge test -m PATTERN`

To run tests in contracts matching a regex pattern `forge test --mc PATTERN`

Set `-vvv` to see a stack trace for a failed test.

---

To install new foundry submodules: `forge install UserName/RepoName@CommitHash`

To remove: `forge remove UserName/RepoName`

---

## Troubleshooting

### Common Issues

1. **Unicode Character Errors**: If you encounter Unicode character errors during compilation, ensure all console.log statements use ASCII characters only.

2. **Environment Variable Issues**: If environment variables are not loading properly, use hardcoded addresses in deployment scripts for testing.

3. **Gas Estimation Errors**: Ensure your account has sufficient HSK tokens for gas fees on HashKey testnet.

4. **Network Connection Issues**: Verify the RPC URL and network connectivity to HashKey testnet.

### HashKey Testnet Specific Notes

- **Gas Price**: HashKey testnet uses very low gas prices (around 0.001 gwei)
- **Block Time**: Approximately 2-3 seconds per block
- **Test Tokens**: Obtain HSK testnet tokens from HashKey faucet
- **Contract Verification**: Use HashKey testnet explorer to verify deployed contracts

### Support

For issues specific to HashKey testnet deployment:
1. Check the deployment logs in `broadcast/` directory
2. Verify contract addresses on HashKey testnet explorer
3. Ensure all dependencies are properly deployed before main contract deployment

### Security Notes

⚠️ **Important**: This deployment uses simplified mock contracts for testing purposes only. For production use:
- Replace mock contracts with production-grade implementations
- Use real USDC or other established collateral tokens
- Implement proper CTF framework integration
- Conduct thorough security audits

