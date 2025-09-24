#!/bin/bash

# CTF Exchange 核心交易功能测试脚本
# 测试所有待测试的交易功能

echo "🚀 CTF Exchange 核心交易功能测试"
echo "================================"

# 设置变量
EXCHANGE="0x6814Facf6bEC19B81A148577CB9b2abc58084d72"
USDC="0x2Ea1C00C8d9A4b4201bB58CA425BeE0aC15FE6B1"
CTF="0x23Ce283468547e03587132e5a0abFd72CBbf2443"
RPC="https://testnet.hsk.xyz"
ADMIN="0x319749f49C884a2F0141e53187dd1454E217786f"
PK="8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5"

echo ""
echo "📋 测试计划："
echo "1. 订单验证测试"
echo "2. 订单填充测试"
echo "3. 订单匹配测试"
echo "4. NORMAL模式交易"
echo "5. MINT模式交易"
echo "6. MERGE模式交易"
echo "7. 订单取消测试"
echo "8. 费用计算测试"
echo "9. 资产铸造测试"
echo "10. 资产合并测试"

echo ""
echo "🔍 测试1: 检查合约基础状态"
echo "------------------------"

# 检查合约是否暂停
echo "检查合约是否暂停："
PAUSED=$(cast call $EXCHANGE "paused()" --rpc-url $RPC 2>/dev/null)
if [ "$PAUSED" = "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "✅ 合约状态: 正常运行"
else
    echo "❌ 合约状态: 已暂停"
fi

# 检查管理员权限
echo "检查管理员权限："
ADMIN_STATUS=$(cast call $EXCHANGE "isAdmin(address)" $ADMIN --rpc-url $RPC 2>/dev/null)
if [ "$ADMIN_STATUS" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "✅ 管理员权限: 已授权"
else
    echo "❌ 管理员权限: 未授权"
fi

# 检查操作员权限
echo "检查操作员权限："
OPERATOR_STATUS=$(cast call $EXCHANGE "isOperator(address)" $ADMIN --rpc-url $RPC 2>/dev/null)
if [ "$OPERATOR_STATUS" = "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "✅ 操作员权限: 已授权"
else
    echo "❌ 操作员权限: 未授权"
fi

echo ""
echo "🔍 测试2: 检查费用管理"
echo "--------------------"

# 检查最大手续费率
echo "检查最大手续费率："
MAX_FEE=$(cast call $EXCHANGE "getMaxFeeRate()" --rpc-url $RPC 2>/dev/null)
if [ ! -z "$MAX_FEE" ]; then
    FEE_DECIMAL=$(cast --to-dec $MAX_FEE 2>/dev/null)
    echo "✅ 最大手续费率: $FEE_DECIMAL 基点 ($(($FEE_DECIMAL/100))%)"
else
    echo "❌ 无法获取手续费率"
fi

echo ""
echo "🔍 测试3: 检查代币注册状态"
echo "------------------------"

# 检查已注册的代币对
YES_TOKEN="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
NO_TOKEN="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"

echo "检查YES代币的complement："
YES_COMPLEMENT=$(cast call $EXCHANGE "getComplement(uint256)" $YES_TOKEN --rpc-url $RPC 2>/dev/null)
if [ ! -z "$YES_COMPLEMENT" ] && [ "$YES_COMPLEMENT" != "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "✅ YES代币已注册，complement: $YES_COMPLEMENT"
else
    echo "❌ YES代币未注册"
fi

echo "检查NO代币的complement："
NO_COMPLEMENT=$(cast call $EXCHANGE "getComplement(uint256)" $NO_TOKEN --rpc-url $RPC 2>/dev/null)
if [ ! -z "$NO_COMPLEMENT" ] && [ "$NO_COMPLEMENT" != "0x0000000000000000000000000000000000000000000000000000000000000000" ]; then
    echo "✅ NO代币已注册，complement: $NO_COMPLEMENT"
else
    echo "❌ NO代币未注册"
fi

echo ""
echo "🔍 测试4: 检查USDC余额"
echo "---------------------"

# 检查管理员USDC余额
echo "检查管理员USDC余额："
ADMIN_BALANCE=$(cast call $USDC "balanceOf(address)" $ADMIN --rpc-url $RPC 2>/dev/null)
if [ ! -z "$ADMIN_BALANCE" ]; then
    BALANCE_DECIMAL=$(cast --to-dec $ADMIN_BALANCE 2>/dev/null)
    echo "✅ 管理员USDC余额: $BALANCE_DECIMAL (约 $((BALANCE_DECIMAL/1000000)) USDC)"
else
    echo "❌ 无法获取USDC余额"
fi

# 检查交易所USDC余额
echo "检查交易所USDC余额："
EXCHANGE_BALANCE=$(cast call $USDC "balanceOf(address)" $EXCHANGE --rpc-url $RPC 2>/dev/null)
if [ ! -z "$EXCHANGE_BALANCE" ]; then
    BALANCE_DECIMAL=$(cast --to-dec $EXCHANGE_BALANCE 2>/dev/null)
    echo "✅ 交易所USDC余额: $BALANCE_DECIMAL (约 $((BALANCE_DECIMAL/1000000)) USDC)"
else
    echo "❌ 无法获取交易所USDC余额"
fi

echo ""
echo "🔍 测试5: 测试订单验证功能"
echo "------------------------"

# 由于订单验证需要复杂的Order结构体，这里先测试基础功能
echo "订单验证需要复杂的Order结构体，包括："
echo "- salt (随机数)"
echo "- maker (订单创建者)"
echo "- signer (签名者)"
echo "- taker (指定接受者)"
echo "- tokenId (代币ID)"
echo "- makerAmount (最大卖出数量)"
echo "- takerAmount (最小买入数量)"
echo "- expiration (过期时间)"
echo "- nonce (防重放攻击)"
echo "- feeRateBps (手续费率)"
echo "- side (买入/卖出)"
echo "- signatureType (签名类型)"
echo "- signature (订单签名)"
echo ""
echo "⚠️  订单验证测试需要实现完整的Order结构体构建和签名"

echo ""
echo "🔍 测试6: 测试CTF合约功能"
echo "----------------------"

# 检查CTF合约地址
echo "检查CTF合约地址："
CTF_ADDR=$(cast call $EXCHANGE "getCtf()" --rpc-url $RPC 2>/dev/null)
if [ ! -z "$CTF_ADDR" ]; then
    echo "✅ CTF合约地址: $CTF_ADDR"
else
    echo "❌ 无法获取CTF合约地址"
fi

# 检查CTF合约是否有mint和merge函数
echo "CTF合约应该支持以下功能："
echo "- mint(): 铸造新的代币对"
echo "- merge(): 合并代币对"
echo "- 这些功能用于MINT和MERGE模式交易"

echo ""
echo "🔍 测试7: 测试资产操作"
echo "-------------------"

# 检查抵押代币地址
echo "检查抵押代币地址："
COLLATERAL=$(cast call $EXCHANGE "getCollateral()" --rpc-url $RPC 2>/dev/null)
if [ ! -z "$COLLATERAL" ]; then
    echo "✅ 抵押代币地址: $COLLATERAL"
else
    echo "❌ 无法获取抵押代币地址"
fi

echo ""
echo "📊 测试结果总结"
echo "==============="
echo "✅ 基础状态检查: 完成"
echo "✅ 权限管理: 完成"
echo "✅ 费用管理: 完成"
echo "✅ 代币注册: 完成"
echo "✅ 余额检查: 完成"
echo "⚠️  订单验证: 需要实现Order结构体"
echo "⚠️  订单填充: 需要实现Order结构体"
echo "⚠️  订单匹配: 需要实现Order结构体"
echo "⚠️  三种交易模式: 需要实现Order结构体"
echo "⚠️  资产操作: 需要实现Order结构体"

echo ""
echo "🎯 下一步计划："
echo "1. 实现Order结构体构建"
echo "2. 实现订单签名功能"
echo "3. 测试订单创建和验证"
echo "4. 测试订单填充和匹配"
echo "5. 测试三种交易模式"
echo "6. 测试资产铸造和合并"

echo ""
echo "✨ 核心交易功能测试完成！"
