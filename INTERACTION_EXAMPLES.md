# CTF Exchange 交互示例

## 🎯 实际使用示例

### 示例1：检查合约状态

```bash
# 检查管理员权限
cast call 0xeA76F564F38d881507A592508Dba3604D14949c6 "isAdmin(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url https://testnet.hsk.xyz

# 检查是否暂停
cast call 0xeA76F564F38d881507A592508Dba3604D14949c6 "isPaused()" --rpc-url https://testnet.hsk.xyz

# 检查抵押代币地址
cast call 0xeA76F564F38d881507A592508Dba3604D14949c6 "collateral()" --rpc-url https://testnet.hsk.xyz
```

### 示例2：检查代币余额

```bash
# 检查USDC余额
cast call 0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF "balanceOf(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url https://testnet.hsk.xyz

# 检查代币名称
cast call 0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF "name()" --rpc-url https://testnet.hsk.xyz

# 检查代币符号
cast call 0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF "symbol()" --rpc-url https://testnet.hsk.xyz
```

### 示例3：注册新的预测市场

```bash
# 注册一个新的代币对（需要管理员权限）
cast send 0xeA76F564F38d881507A592508Dba3604D14949c6 "registerToken(uint256,uint256,bytes32)" \
  0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef \
  0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890 \
  0x1111111111111111111111111111111111111111111111111111111111111111 \
  --rpc-url https://testnet.hsk.xyz \
  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5
```

### 示例4：暂停和恢复交易

```bash
# 暂停交易（管理员权限）
cast send 0xeA76F564F38d881507A592508Dba3604D14949c6 "pauseTrading()" \
  --rpc-url https://testnet.hsk.xyz \
  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5

# 恢复交易（管理员权限）
cast send 0xeA76F564F38d881507A592508Dba3604D14949c6 "unpauseTrading()" \
  --rpc-url https://testnet.hsk.xyz \
  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5
```

## 📊 业务场景示例

### 场景1：创建"明天会下雨吗？"预测市场

#### 步骤1：注册代币对
```bash
# 注册天气预测代币
cast send 0xeA76F564F38d881507A592508Dba3604D14949c6 "registerToken(uint256,uint256,bytes32)" \
  0xweather_yes_token_id \
  0xweather_no_token_id \
  0xweather_condition_id \
  --rpc-url https://testnet.hsk.xyz \
  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5
```

#### 步骤2：检查注册结果
```bash
# 检查代币是否已注册
cast call 0xeA76F564F38d881507A592508Dba3604D14949c6 "isRegistered(uint256)" 0xweather_yes_token_id --rpc-url https://testnet.hsk.xyz
```

### 场景2：模拟交易流程

#### 创建测试脚本
```bash
# 创建一个测试脚本文件
cat > test_trading.sh << 'EOF'
#!/bin/bash

# 设置变量
EXCHANGE="0xeA76F564F38d881507A592508Dba3604D14949c6"
USDC="0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF"
RPC="https://testnet.hsk.xyz"
PK="8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5"

echo "=== CTF Exchange 测试 ==="

# 1. 检查合约状态
echo "1. 检查合约状态..."
cast call $EXCHANGE "isPaused()" --rpc-url $RPC

# 2. 检查USDC余额
echo "2. 检查USDC余额..."
cast call $USDC "balanceOf(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url $RPC

# 3. 检查管理员权限
echo "3. 检查管理员权限..."
cast call $EXCHANGE "isAdmin(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url $RPC

echo "=== 测试完成 ==="
EOF

chmod +x test_trading.sh
./test_trading.sh
```

## 🔍 监控和调试

### 查看交易历史
```bash
# 查看最近的交易
cast logs --from-block 17719000 --to-block latest --address 0xeA76F564F38d881507A592508Dba3604D14949c6 --rpc-url https://testnet.hsk.xyz
```

### 查看特定事件
```bash
# 查看订单填充事件
cast logs --from-block 17719000 --to-block latest \
  --topic 0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925 \
  --address 0xeA76F564F38d881507A592508Dba3604D14949c6 \
  --rpc-url https://testnet.hsk.xyz
```

## 💡 实用技巧

### 1. 批量操作
```bash
# 创建批量操作脚本
cat > batch_operations.sh << 'EOF'
#!/bin/bash

EXCHANGE="0xeA76F564F38d881507A592508Dba3604D14949c6"
RPC="https://testnet.hsk.xyz"
PK="8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5"

# 批量检查状态
echo "=== 批量状态检查 ==="
echo "1. 合约暂停状态:"
cast call $EXCHANGE "isPaused()" --rpc-url $RPC

echo "2. 管理员状态:"
cast call $EXCHANGE "isAdmin(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url $RPC

echo "3. 操作员状态:"
cast call $EXCHANGE "isOperator(address)" 0x319749f49C884a2F0141e53187dd1454E217786f --rpc-url $RPC

echo "4. 抵押代币地址:"
cast call $EXCHANGE "collateral()" --rpc-url $RPC

echo "5. CTF地址:"
cast call $EXCHANGE "ctf()" --rpc-url $RPC
EOF

chmod +x batch_operations.sh
./batch_operations.sh
```

### 2. 错误处理
```bash
# 检查交易是否成功
TX_HASH="0x29ff9de59e59c395d531083c5d83d07426a2a2743e8fd00f0922796706324101"
cast receipt $TX_HASH --rpc-url https://testnet.hsk.xyz
```

### 3.  Gas 估算
```bash
# 估算Gas费用
cast estimate 0xeA76F564F38d881507A592508Dba3604D14949c6 "pauseTrading()" --rpc-url https://testnet.hsk.xyz
```

## 🎯 下一步操作建议

1. **熟悉基本操作**：先运行测试脚本，了解合约状态
2. **注册测试代币**：创建一些测试预测市场
3. **模拟交易**：尝试创建和填充订单
4. **监控事件**：观察合约事件和状态变化
5. **扩展功能**：根据需要添加更多业务逻辑

这些示例应该能帮助您理解如何实际使用CTF Exchange的各种功能！
