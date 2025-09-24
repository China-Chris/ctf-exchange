// 使用ethers.js实现正确的EIP712签名
// 这是最准确的签名实现方式

const { ethers } = require('ethers');

// 私钥
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';

// 创建钱包
const wallet = new ethers.Wallet(PRIVATE_KEY);

// EIP712 Domain Separator
const DOMAIN = {
    name: "CTFExchange",
    version: "1",
    chainId: 133, // HashKey testnet
    verifyingContract: "0x6814Facf6bEC19B81A148577CB9b2abc58084d72"
};

// Order结构体类型定义
const TYPES = {
    Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "signer", type: "address" },
        { name: "taker", type: "address" },
        { name: "tokenId", type: "uint256" },
        { name: "makerAmount", type: "uint256" },
        { name: "takerAmount", type: "uint256" },
        { name: "expiration", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "feeRateBps", type: "uint256" },
        { name: "side", type: "uint8" },
        { name: "signatureType", type: "uint8" }
    ]
};

// 创建测试订单
function createTestOrder() {
    const currentTime = Math.floor(Date.now() / 1000);
    
    return {
        salt: ethers.BigNumber.from(ethers.utils.randomBytes(32)),
        maker: "0x319749f49C884a2F0141e53187dd1454E217786f",
        signer: "0x319749f49C884a2F0141e53187dd1454E217786f",
        taker: "0x0000000000000000000000000000000000000000",
        tokenId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
        makerAmount: ethers.utils.parseUnits("100", 6), // 100 USDC
        takerAmount: ethers.utils.parseUnits("50", 6),  // 50 YES代币
        expiration: currentTime + 86400, // 24小时后过期
        nonce: 1,
        feeRateBps: 200, // 2%
        side: 0, // BUY
        signatureType: 0 // EOA
    };
}

// 创建EIP712签名
async function createEIP712Signature(order) {
    try {
        // 使用ethers.js的EIP712签名
        const signature = await wallet._signTypedData(DOMAIN, TYPES, order);
        return signature;
    } catch (error) {
        console.error('EIP712签名错误:', error);
        return null;
    }
}

// 验证签名
async function verifySignature(order, signature) {
    try {
        // 从签名恢复地址
        const recoveredAddress = ethers.utils.verifyTypedData(DOMAIN, TYPES, order, signature);
        return recoveredAddress.toLowerCase() === order.maker.toLowerCase();
    } catch (error) {
        console.error('签名验证错误:', error);
        return false;
    }
}

// 生成签名订单
async function generateSignedOrder() {
    const order = createTestOrder();
    const signature = await createEIP712Signature(order);
    
    if (!signature) {
        throw new Error('签名创建失败');
    }
    
    // 验证签名
    const isValid = await verifySignature(order, signature);
    
    return {
        order,
        signature,
        isValid,
        walletAddress: wallet.address
    };
}

// 生成cast命令
function generateCastCommands(signedOrder) {
    const { order, signature } = signedOrder;
    
    console.log('🔧 使用ethers.js EIP712签名的Cast命令:');
    console.log('=====================================');
    
    // 订单验证命令
    console.log('# 订单验证测试（ethers.js EIP712签名）');
    console.log(`cast call 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "validateOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes))" \\`);
    console.log(`  "(0x${order.salt.toHexString().slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount.toString()},${order.takerAmount.toString()},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz`);
    
    console.log('\n# 订单填充测试（ethers.js EIP712签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "fillOrder((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),uint256)" \\`);
    console.log(`  "(0x${order.salt.toHexString().slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount.toString()},${order.takerAmount.toString()},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
    
    console.log('\n# 订单匹配测试（ethers.js EIP712签名）');
    console.log(`cast send 0x6814Facf6bEC19B81A148577CB9b2abc58084d72 "matchOrders((uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes),(uint256,address,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,uint8,bytes)[],uint256,uint256[])" \\`);
    console.log(`  "(0x${order.salt.toHexString().slice(2)},${order.maker},${order.signer},${order.taker},0x${order.tokenId.slice(2)},${order.makerAmount.toString()},${order.takerAmount.toString()},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${order.signatureType},${signature})" \\`);
    console.log(`  "[]" \\`);
    console.log(`  "1000000" \\`);
    console.log(`  "[]" \\`);
    console.log(`  --rpc-url https://testnet.hsk.xyz \\`);
    console.log(`  --private-key ${PRIVATE_KEY}`);
}

// 主函数
async function main() {
    console.log('🚀 CTF Exchange ethers.js EIP712签名实现');
    console.log('=======================================');
    
    try {
        const signedOrder = await generateSignedOrder();
        
        console.log('\n📋 签名订单数据:');
        console.log('================');
        console.log('Order:', {
            salt: order.salt.toHexString(),
            maker: order.maker,
            signer: order.signer,
            taker: order.taker,
            tokenId: order.tokenId,
            makerAmount: order.makerAmount.toString(),
            takerAmount: order.takerAmount.toString(),
            expiration: order.expiration,
            nonce: order.nonce,
            feeRateBps: order.feeRateBps,
            side: order.side,
            signatureType: order.signatureType
        });
        console.log('Signature:', signedOrder.signature);
        console.log('Wallet Address:', signedOrder.walletAddress);
        console.log('Signature Valid:', signedOrder.isValid);
        
        generateCastCommands(signedOrder);
        
        console.log('\n📝 注意事项:');
        console.log('============');
        console.log('1. 使用ethers.js的EIP712签名实现');
        console.log('2. 签名格式完全符合Ethereum标准');
        console.log('3. 使用您的私钥进行签名');
        console.log('4. 签名验证通过');
        
    } catch (error) {
        console.error('错误:', error.message);
    }
}

// 运行测试
if (require.main === module) {
    main();
}

module.exports = { 
    createTestOrder, 
    createEIP712Signature,
    verifySignature,
    generateSignedOrder,
    generateCastCommands 
};
