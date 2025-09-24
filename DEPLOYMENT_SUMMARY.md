# HashKey Testnet Deployment Summary

## 🚀 Deployment Status: SUCCESS

**Deployment Date**: December 2024  
**Network**: HashKey Testnet  
**Chain ID**: 133  
**RPC URL**: https://testnet.hsk.xyz  

## 📋 Contract Addresses

| Contract | Address | Type |
|----------|---------|------|
| **CTF Exchange** | `0xF6Dc869Dc65065F605f5F9F9337b4beEC013Eb74` | Main Contract |
| **USDC Mock** | `0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF` | Collateral Token |
| **Conditional Tokens** | `0x86F6d77840B576F01f33C5D9db7c479E7baBfb1F` | CTF Framework |
| **Proxy Factory** | `0x9643AA43149D386435B4D36195E9e00A6d346a31` | Proxy Factory |
| **Safe Factory** | `0x87Df92bD4D799A402e020181332427A285fe9455` | Safe Factory |

## 👤 Admin Configuration

- **Admin Address**: `0x319749f49C884a2F0141e53187dd1454E217786f`
- **Permissions**: Admin + Operator
- **Status**: Active

## 💰 Deployment Costs

- **Total Gas Used**: 3,997,839 gas
- **Total Cost**: 0.000003999042349539 ETH
- **Average Gas Price**: 0.001000301 gwei

## 🔧 Quick Commands

### Check Admin Status
```bash
cast call 0xF6Dc869Dc65065F605f5F9F9337b4beEC013Eb74 "isAdmin(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url https://testnet.hsk.xyz
```

### Check USDC Balance
```bash
cast call 0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF "balanceOf(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url https://testnet.hsk.xyz
```

### Check Exchange Status
```bash
cast call 0xF6Dc869Dc65065F605f5F9F9337b4beEC013Eb74 "paused()" --rpc-url https://testnet.hsk.xyz
```

## 📝 Next Steps

1. **Register Tokens**: Use `registerToken()` to add new trading pairs
2. **Test Trading**: Create and fill test orders
3. **Monitor Events**: Watch for OrderFilled, OrderCancelled events
4. **Configure Fees**: Set appropriate fee rates for trading

## ⚠️ Important Notes

- This deployment uses **mock contracts** for testing only
- For production, replace with real USDC and CTF contracts
- Ensure proper security audits before mainnet deployment
- Monitor gas costs and optimize as needed

## 📊 Transaction Hashes

- **Dependencies Deployment**: `0x3139fa360267576fa7c89379386fde3c69c6ccf3e096e2c3394f6c0e452f344d`
- **Main Exchange Deployment**: `0x29ff9de59e59c395d531083c5d83d07426a2a2743e8fd00f0922796706324101`

## 🔗 Links

- **HashKey Testnet Explorer**: https://testnet.hsk.xyz
- **Project Repository**: This repository
- **Documentation**: See README.md for detailed usage instructions
