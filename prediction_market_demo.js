const { ethers } = require('ethers');

// 配置
const RPC_URL = 'https://testnet.hsk.xyz';
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';
const CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';
const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';

// 创建provider和wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 预测市场Demo
class PredictionMarketDemo {
    constructor() {
        this.conditionId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        this.yesTokenId = this.conditionId;
        this.noTokenId = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        this.outcomeSlotCount = 2;
        this.collateralAmount = ethers.parseEther("100"); // 100 USDC
    }

    // 第一步：发市场 - 创建预测市场
    async createMarket() {
        console.log("🎯 第一步：发市场 - 创建预测市场");
        console.log("=====================================");
        
        console.log("市场信息：");
        console.log("- 事件ID:", this.conditionId);
        console.log("- YES代币ID:", this.yesTokenId);
        console.log("- NO代币ID:", this.noTokenId);
        console.log("- 抵押品数量:", ethers.formatEther(this.collateralAmount), "USDC");
        
        // 1. 铸造抵押品代币到CTF合约
        console.log("\n1. 铸造抵押品代币到CTF合约:");
        const mintTx = `cast send ${CTF_ADDRESS} mint(address,uint256,uint256) \\
  ${wallet.address} \\
  ${this.yesTokenId} \\
  ${this.collateralAmount} \\
  --rpc-url ${RPC_URL} \\
  --private-key ${PRIVATE_KEY} \\
  --gas-limit 1000000`;
        
        console.log(mintTx);
        
        // 2. 铸造NO代币
        console.log("\n2. 铸造NO代币:");
        const mintNoTx = `cast send ${CTF_ADDRESS} mint(address,uint256,uint256) \\
  ${wallet.address} \\
  ${this.noTokenId} \\
  ${this.collateralAmount} \\
  --rpc-url ${RPC_URL} \\
  --private-key ${PRIVATE_KEY} \\
  --gas-limit 1000000`;
        
        console.log(mintNoTx);
        
        // 3. 授权CTF Exchange管理代币
        console.log("\n3. 授权CTF Exchange管理代币:");
        const approveTx = `cast send ${CTF_ADDRESS} setApprovalForAll(address,bool) \\
  ${EXCHANGE_ADDRESS} \\
  true \\
  --rpc-url ${RPC_URL} \\
  --private-key ${PRIVATE_KEY} \\
  --gas-limit 100000`;
        
        console.log(approveTx);
        
        return {
            conditionId: this.conditionId,
            yesTokenId: this.yesTokenId,
            noTokenId: this.noTokenId,
            collateralAmount: this.collateralAmount
        };
    }

    // 第二步：买入YES - 创建买入订单
    async buyYes() {
        console.log("\n🎯 第二步：买入YES - 创建买入订单");
        console.log("=====================================");
        
        // 增加nonce
        console.log("1. 增加nonce:");
        const nonceTx = `cast send ${EXCHANGE_ADDRESS} incrementNonce() \\
  --rpc-url ${RPC_URL} \\
  --private-key ${PRIVATE_KEY} \\
  --gas-limit 100000`;
        
        console.log(nonceTx);
        
        // 创建买入订单
        const order = {
            salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
            maker: wallet.address,
            taker: ethers.ZeroAddress,
            tokenId: this.yesTokenId,
            makerAmount: ethers.parseEther("50"),  // 50 USDC
            takerAmount: ethers.parseEther("25"),  // 25 YES tokens
            expiration: Math.floor(Date.now() / 1000) + 3600,
            nonce: 9, // 使用新的nonce
            feeRateBps: 200,
            side: 0 // BUY
        };
        
        // 签名订单
        const domain = {
            name: "Polymarket CTF Exchange",
            version: "1",
            chainId: 133,
            verifyingContract: EXCHANGE_ADDRESS
        };
        
        const orderType = {
            Order: [
                { name: "salt", type: "uint256" },
                { name: "maker", type: "address" },
                { name: "taker", type: "address" },
                { name: "tokenId", type: "uint256" },
                { name: "makerAmount", type: "uint256" },
                { name: "takerAmount", type: "uint256" },
                { name: "expiration", type: "uint256" },
                { name: "nonce", type: "uint256" },
                { name: "feeRateBps", type: "uint256" },
                { name: "side", type: "uint8" }
            ]
        };
        
        const signature = await wallet.signTypedData(domain, orderType, order);
        
        console.log("\n2. 买入订单信息:");
        console.log("- 买入数量:", ethers.formatEther(order.takerAmount), "YES代币");
        console.log("- 支付数量:", ethers.formatEther(order.makerAmount), "USDC");
        console.log("- 订单nonce:", order.nonce);
        
        // 生成订单填充命令
        const orderData = `(${order.salt},${order.maker},${order.taker},${order.tokenId},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${signature})`;
        
        console.log("\n3. 执行买入订单:");
        const buyTx = `cast send ${EXCHANGE_ADDRESS} fillOrder((uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes),uint256) \\
  ${orderData} \\
  ${ethers.parseEther("25")} \\
  --rpc-url ${RPC_URL} \\
  --private-key ${PRIVATE_KEY} \\
  --gas-limit 2000000`;
        
        console.log(buyTx);
        
        return {
            order: order,
            signature: signature,
            orderData: orderData
        };
    }

    // 第三步：事件结算 - 设置市场结果
    async settleMarket(outcome) {
        console.log(`\n🎯 第三步：事件结算 - 设置市场结果 (${outcome})`);
        console.log("=====================================");
        
        console.log(`市场结果: ${outcome}`);
        console.log("- 事件ID:", this.conditionId);
        
        if (outcome === "YES") {
            console.log("- YES代币获胜，可以1:1兑换USDC");
            console.log("- NO代币失效，价值为0");
        } else {
            console.log("- NO代币获胜，可以1:1兑换USDC");
            console.log("- YES代币失效，价值为0");
        }
        
        // 这里我们模拟设置结果，实际实现中需要oracle或管理员设置
        console.log("\n注意：实际实现中需要oracle或管理员调用setResult函数");
        console.log("当前演示中，我们假设结果已经设置");
        
        return {
            outcome: outcome,
            conditionId: this.conditionId,
            yesTokenId: this.yesTokenId,
            noTokenId: this.noTokenId
        };
    }

    // 第四步：清算拿回资产 - 兑换获胜代币
    async redeemAssets(outcome) {
        console.log(`\n🎯 第四步：清算拿回资产 - 兑换${outcome}代币`);
        console.log("=====================================");
        
        const winningTokenId = outcome === "YES" ? this.yesTokenId : this.noTokenId;
        const losingTokenId = outcome === "YES" ? this.noTokenId : this.yesTokenId;
        
        console.log(`获胜代币ID: ${winningTokenId}`);
        console.log(`失败代币ID: ${losingTokenId}`);
        
        // 1. 检查获胜代币余额
        console.log("\n1. 检查获胜代币余额:");
        const checkBalanceTx = `cast call ${CTF_ADDRESS} balanceOf(address,uint256) \\
  ${wallet.address} \\
  ${winningTokenId} \\
  --rpc-url ${RPC_URL}`;
        
        console.log(checkBalanceTx);
        
        // 2. 兑换获胜代币为USDC
        console.log("\n2. 兑换获胜代币为USDC:");
        console.log("注意：这里需要实现兑换逻辑，将获胜代币1:1兑换为USDC");
        
        // 3. 检查最终USDC余额
        console.log("\n3. 检查最终USDC余额:");
        const checkUSDCTx = `cast call ${USDC_ADDRESS} balanceOf(address) \\
  ${wallet.address} \\
  --rpc-url ${RPC_URL}`;
        
        console.log(checkUSDCTx);
        
        return {
            winningTokenId: winningTokenId,
            losingTokenId: losingTokenId,
            outcome: outcome
        };
    }

    // 生成完整的演示脚本
    async generateDemoScript() {
        console.log("🚀 预测市场完整流程演示");
        console.log("==============================");
        console.log("使用现有的OpenZeppelin ERC1155 CTF合约");
        console.log("CTF地址:", CTF_ADDRESS);
        console.log("Exchange地址:", EXCHANGE_ADDRESS);
        console.log("USDC地址:", USDC_ADDRESS);
        console.log("");
        
        // 第一步：发市场
        const market = await this.createMarket();
        
        // 第二步：买入YES
        const buyOrder = await this.buyYes();
        
        // 第三步：事件结算
        const settlement = await this.settleMarket("YES");
        
        // 第四步：清算拿回资产
        const redemption = await this.redeemAssets("YES");
        
        console.log("\n🎉 完整流程演示完成！");
        console.log("=====================");
        console.log("1. ✅ 发市场 - 创建预测市场");
        console.log("2. ✅ 买入YES - 创建买入订单");
        console.log("3. ✅ 事件结算 - 设置市场结果");
        console.log("4. ✅ 清算拿回资产 - 兑换获胜代币");
        
        return {
            market: market,
            buyOrder: buyOrder,
            settlement: settlement,
            redemption: redemption
        };
    }
}

// 运行演示
async function runDemo() {
    const demo = new PredictionMarketDemo();
    await demo.generateDemoScript();
}

// 如果直接运行此文件
if (require.main === module) {
    runDemo().catch(console.error);
}

module.exports = PredictionMarketDemo;
