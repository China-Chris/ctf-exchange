#!/bin/bash

# CTF Exchange 快速测试脚本
# 用于测试已部署的合约功能

echo "🚀 CTF Exchange 快速测试"
echo "=========================="

# 设置变量
EXCHANGE="0xF6Dc869Dc65065F605f5F9F9337b4beEC013Eb74"
USDC="0x312A5Dea6478Ca7BA650F48F9E6fe949cA74BAaF"
CTF="0x86F6d77840B576F01f33C5D9db7c479E7baBfb1F"
RPC="https://testnet.hsk.xyz"
ADMIN="0x319749f49C884a2F0141e53187dd1454E217786f"

echo ""
echo "📋 1. 检查合约状态"
echo "-------------------"

echo "✅ 合约地址: $EXCHANGE"
echo "✅ 网络: HashKey Testnet (Chain ID: 133)"
echo "✅ RPC: $RPC"

echo ""
echo "🔍 2. 检查基本状态"
echo "-------------------"

# 检查是否暂停
PAUSED=$(cast call $EXCHANGE "paused()" --rpc-url $RPC 2>/dev/null)
if [ "$PAUSED" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "✅ 交易状态: 正常运行"
else
    echo "❌ 交易状态: 已暂停"
fi

# 检查管理员权限
ADMIN_STATUS=$(cast call $EXCHANGE "isAdmin(address)" $ADMIN --rpc-url $RPC 2>/dev/null)
if [ "$ADMIN_STATUS" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "✅ 管理员权限: 已授权"
else
    echo "❌ 管理员权限: 未授权"
fi

# 检查操作员权限
OPERATOR_STATUS=$(cast call $EXCHANGE "isOperator(address)" $ADMIN --rpc-url $RPC 2>/dev/null)
if [ "$OPERATOR_STATUS" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "✅ 操作员权限: 已授权"
else
    echo "❌ 操作员权限: 未授权"
fi

echo ""
echo "💰 3. 检查代币信息"
echo "-------------------"

# 检查USDC信息
USDC_NAME=$(cast call $USDC "name()" --rpc-url $RPC 2>/dev/null)
USDC_SYMBOL=$(cast call $USDC "symbol()" --rpc-url $RPC 2>/dev/null)
USDC_BALANCE=$(cast call $USDC "balanceOf(address)" $ADMIN --rpc-url $RPC 2>/dev/null)

echo "✅ 抵押代币: $USDC_NAME ($USDC_SYMBOL)"
echo "✅ 地址: $USDC"
echo "✅ 管理员余额: $(cast --to-dec $USDC_BALANCE 2>/dev/null) $USDC_SYMBOL"

echo ""
echo "🔧 4. 检查合约配置"
echo "-------------------"

# 检查抵押代币地址
COLLATERAL=$(cast call $EXCHANGE "getCollateral()" --rpc-url $RPC 2>/dev/null)
echo "✅ 抵押代币地址: $COLLATERAL"

# 检查CTF地址
CTF_ADDR=$(cast call $EXCHANGE "getCtf()" --rpc-url $RPC 2>/dev/null)
echo "✅ CTF地址: $CTF_ADDR"

echo ""
echo "📊 5. 测试结果总结"
echo "-------------------"

if [ "$PAUSED" = "0x0000000000000000000000000000000000000000000000000000000000000000" ] && \
   [ "$ADMIN_STATUS" = "0x0000000000000000000000000000000000000000000000000000000000000001" ] && \
   [ "$OPERATOR_STATUS" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "🎉 所有测试通过！合约已正确部署并配置"
    echo ""
    echo "📚 下一步操作："
    echo "   1. 查看业务指南: cat BUSINESS_GUIDE.md"
    echo "   2. 查看交互示例: cat INTERACTION_EXAMPLES.md"
    echo "   3. 注册新的代币对进行测试"
    echo "   4. 创建和测试订单"
else
    echo "⚠️  部分测试失败，请检查合约状态"
fi

echo ""
echo "🔗 有用的命令："
echo "   - 查看详细状态: cast call $EXCHANGE 'isPaused()' --rpc-url $RPC"
echo "   - 查看管理员: cast call $EXCHANGE 'isAdmin(address)' $ADMIN --rpc-url $RPC"
echo "   - 查看余额: cast call $USDC 'balanceOf(address)' $ADMIN --rpc-url $RPC"
echo ""
echo "✨ 测试完成！"
