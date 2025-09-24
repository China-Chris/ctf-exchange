#!/usr/bin/env bash

# 查找 HashKey 测试网上的现有合约
echo "🔍 查找 HashKey 测试网上的现有合约..."

# 加载环境变量
source .env.hashkey

echo "RPC URL: $RPC_URL"
echo "Chain ID: $CHAIN_ID"
echo ""

# 检查网络连接
echo "📡 检查网络连接..."
cast block-number --rpc-url $RPC_URL

echo ""
echo "💡 建议："
echo "1. 检查 HashKey 测试网是否有 USDC 等标准代币"
echo "2. 查看是否有 Gnosis Safe 工厂合约"
echo "3. 检查是否有条件代币框架"
echo "4. 如果没有，可以使用简化版部署脚本"
