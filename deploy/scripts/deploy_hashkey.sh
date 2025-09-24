#!/usr/bin/env bash

# HashKey 测试链部署脚本
# 使用方法: ./deploy_hashkey.sh

echo "🚀 开始部署 CTF Exchange 到 HashKey 测试链..."

# 检查环境文件是否存在
if [ ! -f ".env.hashkey" ]; then
    echo "❌ 错误: .env.hashkey 文件不存在"
    echo "请先创建 .env.hashkey 文件并配置相关参数"
    exit 1
fi

# 加载环境变量
source .env.hashkey

echo "📋 部署参数:"
echo "Admin: $ADMIN"
echo "Collateral: $COLLATERAL"
echo "CTF: $CTF"
echo "Proxy Factory: $PROXY_FACTORY"
echo "Safe Factory: $SAFE_FACTORY"
echo "RPC URL: $RPC_URL"
echo "Chain ID: $CHAIN_ID"
echo ""

# 检查必要的参数
if [ "$PK" = "your_private_key_here" ]; then
    echo "❌ 错误: 请设置您的私钥"
    exit 1
fi

if [ "$RPC_URL" = "https://rpc.hashkey-testnet.com" ]; then
    echo "⚠️  警告: 请设置正确的 HashKey 测试链 RPC URL"
fi

if [ "$COLLATERAL" = "0x0000000000000000000000000000000000000000" ]; then
    echo "⚠️  警告: 请设置正确的抵押代币地址"
fi

echo "🔨 开始编译和部署..."

# 运行部署脚本
forge script HashKeyDeployment \
    --private-key $PK \
    --rpc-url $RPC_URL \
    --chain-id $CHAIN_ID \
    --json \
    --broadcast \
    --verify \
    -s "run()" \
    --gas-price 1000000000

echo "✅ 部署完成！"
echo "请检查上面的输出获取合约地址"
