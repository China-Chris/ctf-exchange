// Order结构体构建和测试脚本 (纯JavaScript版本)
// 用于测试CTF Exchange的核心交易功能

// 生成随机数
function randomHex(length) {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

// 创建测试订单
function createTestOrder() {
    const currentTime = Math.floor(Date.now() / 1000);
    
    return {
        salt: randomHex(64), // 32字节随机数
        maker: '0x319749f49C884a2F0141e53187dd1454E217786f',
        signer: '0x319749f49C884a2F0141e53187dd1454E217786f',
        taker: '0x0000000000000000000000000000000000000000', // 公开订单
        tokenId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', // YES代币
        makerAmount: '100000000', // 100 USDC (6位小数)
        takerAmount: '50000000',  // 50 YES代币 (6位小数)
        expiration: (currentTime + 86400).toString(), // 24小时后过期
        nonce: '1',
        feeRateBps: '200', // 2%
        side: '0', // BUY
        signatureType: '0', // EOA
        signature: '0x' // 需要实际签名
    };
}

// 生成测试数据
function generateTestData() {
    const order = createTestOrder();
    
    console.log('📋 测试订单数据:');
    console.log('================');
    console.log('Salt:', order.salt);
    console.log('Maker:', order.maker);
    console.log('Signer:', order.signer);
    console.log('Taker:', order.taker);
    console.log('TokenId:', order.tokenId);
    console.log('MakerAmount:', order.makerAmount);
    console.log('TakerAmount:', order.takerAmount);
    console.log('Expiration:', order.expiration);
    console.log('Nonce:', order.nonce);
    console.log('FeeRateBps:', order.feeRateBps);
    console.log('Side:', order.side, '(0=BUY, 1=SELL)');
    console.log('SignatureType:', order.signatureType, '(0=EOA, 1=CONTRACT)');
    
    return order;
}

// 生成cast命令
function generateCastCommands(order) {
    console.log('\n🔧 Cast命令示例:');
    console.log('================');
    
    // 订单验证命令
    console.log('# 订单验证测试');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "${order.salt}" \\`);
    console.log(`  "${order.maker}" \\`);
    console.log(`  "${order.signer}" \\`);
    console.log(`  "${order.taker}" \\`);
    console.log(`  "${order.tokenId}" \\`);
    console.log(`  "${order.makerAmount}" \\`);
    console.log(`  "${order.takerAmount}" \\`);
    console.log(`  "${order.expiration}" \\`);
    console.log(`  "${order.nonce}" \\`);
    console.log(`  "${order.feeRateBps}" \\`);
    console.log(`  "${order.side}" \\`);
    console.log(`  "${order.signatureType}" \\`);
    console.log(`  "0x" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 订单填充测试 (需要操作员权限)');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "${order.salt}" \\`);
    console.log(`  "${order.maker}" \\`);
    console.log(`  "${order.signer}" \\`);
    console.log(`  "${order.taker}" \\`);
    console.log(`  "${order.tokenId}" \\`);
    console.log(`  "${order.makerAmount}" \\`);
    console.log(`  "${order.takerAmount}" \\`);
    console.log(`  "${order.expiration}" \\`);
    console.log(`  "${order.nonce}" \\`);
    console.log(`  "${order.feeRateBps}" \\`);
    console.log(`  "${order.side}" \\`);
    console.log(`  "${order.signatureType}" \\`);
    console.log(`  "0x" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5`);
    
    console.log('\n# 订单取消测试');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "cancelOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "${order.salt}" \\`);
    console.log(`  "${order.maker}" \\`);
    console.log(`  "${order.signer}" \\`);
    console.log(`  "${order.taker}" \\`);
    console.log(`  "${order.tokenId}" \\`);
    console.log(`  "${order.makerAmount}" \\`);
    console.log(`  "${order.takerAmount}" \\`);
    console.log(`  "${order.expiration}" \\`);
    console.log(`  "${order.nonce}" \\`);
    console.log(`  "${order.feeRateBps}" \\`);
    console.log(`  "${order.side}" \\`);
    console.log(`  "${order.signatureType}" \\`);
    console.log(`  "0x" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key 8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5`);
}

// 主函数
function main() {
    console.log('🚀 CTF Exchange Order结构体测试');
    console.log('===============================');
    
    const order = generateTestData();
    generateCastCommands(order);
    
    console.log('\n📝 注意事项:');
    console.log('============');
    console.log('1. 订单签名需要EIP712标准');
    console.log('2. 需要操作员权限才能填充订单');
    console.log('3. 订单必须有效且未过期');
    console.log('4. 需要足够的资产余额');
    console.log('5. 模拟CTF合约功能有限');
    console.log('6. 订单验证可能因为签名问题失败');
}

// 运行测试
main();
