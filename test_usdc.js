const USDCClaimer = require('./claim_usdc.js');

async function testUSDC() {
    console.log("🧪 测试USDC领取功能");
    console.log("====================");
    
    const claimer = new USDCClaimer();
    const testAddress = "0x319749f49C884a2F0141e53187dd1454E217786f";
    
    console.log("\n1. 检查当前余额:");
    const balanceResult = await claimer.checkBalance(testAddress);
    if (balanceResult.success) {
        console.log(`✅ 当前余额: ${balanceResult.balance} USDC`);
    } else {
        console.log(`❌ 余额检查失败: ${balanceResult.message}`);
    }
    
    console.log("\n2. 测试USDC领取:");
    const claimResult = await claimer.claimUSDC(testAddress);
    if (claimResult.success) {
        console.log(`✅ 领取结果: ${claimResult.message}`);
        if (claimResult.transactionHash) {
            console.log(`   交易哈希: ${claimResult.transactionHash}`);
        }
        if (claimResult.userBalance) {
            console.log(`   用户余额: ${claimResult.userBalance} USDC`);
        }
    } else {
        console.log(`❌ 领取失败: ${claimResult.message}`);
    }
    
    console.log("\n3. 检查领取后余额:");
    const finalBalanceResult = await claimer.checkBalance(testAddress);
    if (finalBalanceResult.success) {
        console.log(`✅ 最终余额: ${finalBalanceResult.balance} USDC`);
    } else {
        console.log(`❌ 余额检查失败: ${finalBalanceResult.message}`);
    }
    
    console.log("\n🎉 测试完成！");
}

// 运行测试
testUSDC().catch(console.error);
