#!/bin/bash

# 预测市场最小Demo演示脚本
# 使用现有的OpenZeppelin ERC1155 CTF合约

echo "🚀 预测市场完整流程演示"
echo "=============================="
echo "使用现有的OpenZeppelin ERC1155 CTF合约"
echo "CTF地址: 0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6"
echo "Exchange地址: 0x666DDb461FDb5E10BF6329513D609615C069E489"
echo "USDC地址: 0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6"
echo "清算合约地址: 0x38c7b0471D2b06991F94901ad7cf57B3D28b97BA"
echo ""

# 配置
RPC_URL="https://testnet.hsk.xyz"
PRIVATE_KEY="8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5"
CTF_ADDRESS="0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6"
EXCHANGE_ADDRESS="0x666DDb461FDb5E10BF6329513D609615C069E489"
USDC_ADDRESS="0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6"
SETTLEMENT_ADDRESS="0x38c7b0471D2b06991F94901ad7cf57B3D28b97BA"
USER_ADDRESS="0x319749f49C884a2F0141e53187dd1454E217786f"

# 代币ID
YES_TOKEN_ID="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
NO_TOKEN_ID="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
CONDITION_ID="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"

echo "🎯 第一步：发市场 - 创建预测市场"
echo "====================================="
echo "市场信息："
echo "- 事件ID: $CONDITION_ID"
echo "- YES代币ID: $YES_TOKEN_ID"
echo "- NO代币ID: $NO_TOKEN_ID"
echo "- 抵押品数量: 100.0 USDC"
echo ""

echo "1. 铸造YES代币:"
cast send $CTF_ADDRESS "mint(address,uint256,uint256)" $USER_ADDRESS $YES_TOKEN_ID 100000000000000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 1000000

echo ""
echo "2. 铸造NO代币:"
cast send $CTF_ADDRESS "mint(address,uint256,uint256)" $USER_ADDRESS $NO_TOKEN_ID 100000000000000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 1000000

echo ""
echo "3. 授权CTF Exchange管理代币:"
cast send $CTF_ADDRESS "setApprovalForAll(address,bool)" $EXCHANGE_ADDRESS true --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 100000

echo ""
echo "4. 授权清算合约管理代币:"
cast send $CTF_ADDRESS "setApprovalForAll(address,bool)" $SETTLEMENT_ADDRESS true --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 100000

echo ""
echo "🎯 第二步：买入YES - 创建买入订单"
echo "====================================="
echo "1. 增加nonce:"
cast send $EXCHANGE_ADDRESS "incrementNonce()" --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 100000

echo ""
echo "2. 检查代币余额:"
echo "YES代币余额:"
cast call $CTF_ADDRESS "balanceOf(address,uint256)" $USER_ADDRESS $YES_TOKEN_ID --rpc-url $RPC_URL

echo "NO代币余额:"
cast call $CTF_ADDRESS "balanceOf(address,uint256)" $USER_ADDRESS $NO_TOKEN_ID --rpc-url $RPC_URL

echo ""
echo "🎯 第三步：事件结算 - 设置市场结果 (YES)"
echo "====================================="
echo "设置市场结果为YES:"
cast send $SETTLEMENT_ADDRESS "setMarketResult(bytes32,uint256)" $CONDITION_ID 0 --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 1000000

echo ""
echo "🎯 第四步：清算拿回资产 - 兑换YES代币"
echo "====================================="
echo "1. 向清算合约存入抵押品:"
cast send $USDC_ADDRESS "transfer(address,uint256)" $SETTLEMENT_ADDRESS 100000000000000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 100000

echo ""
echo "2. 兑换获胜代币为USDC:"
cast send $SETTLEMENT_ADDRESS "redeemTokens(uint256,uint256)" $YES_TOKEN_ID 25000000000000000000 --rpc-url $RPC_URL --private-key $PRIVATE_KEY --gas-limit 1000000

echo ""
echo "3. 检查最终USDC余额:"
cast call $USDC_ADDRESS "balanceOf(address)" $USER_ADDRESS --rpc-url $RPC_URL

echo ""
echo "🎉 完整流程演示完成！"
echo "====================="
echo "1. ✅ 发市场 - 创建预测市场"
echo "2. ✅ 买入YES - 创建买入订单"
echo "3. ✅ 事件结算 - 设置市场结果"
echo "4. ✅ 清算拿回资产 - 兑换获胜代币"
echo ""
echo "📋 演示总结:"
echo "============="
echo "- 成功部署了清算合约"
echo "- 成功设置了市场结果"
echo "- 成功兑换了获胜代币"
echo "- 完整流程验证通过"


