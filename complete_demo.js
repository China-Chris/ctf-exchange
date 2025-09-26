const { ethers } = require('ethers');

// 配置
const RPC_URL = 'https://testnet.hsk.xyz';
const PRIVATE_KEY = '8ad5b3c82c433bb80dda9510959e94a695b1ff5d8ae01da4fac55b05494aa0f5';
const EXCHANGE_ADDRESS = '0x666DDb461FDb5E10BF6329513D609615C069E489';
const CTF_ADDRESS = '0x3338E58FAFfE71F89b2Bcb48384C9424c36060c6';
const USDC_ADDRESS = '0xC1C68E532E3F2e1F40e6b5EBC9D6c5f8c5e803D6';
const SETTLEMENT_ADDRESS = '0x38c7b0471D2b06991F94901ad7cf57B3D28b97BA';

// 创建provider和wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 预测市场完整演示
class CompletePredictionMarketDemo {
    constructor() {
        this.conditionId = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
        this.yesTokenId = this.conditionId;
        this.noTokenId = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
        this.collateralAmount = ethers.parseEther("100"); // 100 USDC
        this.transactionHashes = [];
    }

    // 执行命令并记录交易哈希
    async executeCommand(command, description) {
        console.log(`\n${description}:`);
        console.log(command);
        
        try {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('Warning')) {
                console.error('Error:', stderr);
                return null;
            }
            
            // 提取交易哈希
            const hashMatch = stdout.match(/transactionHash\s+([a-fA-F0-9x]+)/);
            if (hashMatch) {
                const txHash = hashMatch[1];
                this.transactionHashes.push({ description, hash: txHash });
                console.log(`✅ 成功! 交易哈希: ${txHash}`);
                return txHash;
            }
            
            console.log('✅ 成功!');
            return stdout;
        } catch (error) {
            console.error('❌ 执行失败:', error.message);
            return null;
        }
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
        
        // 1. 铸造YES代币
        const mintYesCmd = `cast send ${CTF_ADDRESS} mint(address,uint256,uint256) ${wallet.address} ${this.yesTokenId} ${this.collateralAmount} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 1000000`;
        await this.executeCommand(mintYesCmd, "铸造YES代币");
        
        // 2. 铸造NO代币
        const mintNoCmd = `cast send ${CTF_ADDRESS} mint(address,uint256,uint256) ${wallet.address} ${this.noTokenId} ${this.collateralAmount} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 1000000`;
        await this.executeCommand(mintNoCmd, "铸造NO代币");
        
        // 3. 授权CTF Exchange管理代币
        const approveCmd = `cast send ${CTF_ADDRESS} setApprovalForAll(address,bool) ${EXCHANGE_ADDRESS} true --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 100000`;
        await this.executeCommand(approveCmd, "授权CTF Exchange管理代币");
        
        // 4. 授权清算合约管理代币
        const approveSettlementCmd = `cast send ${CTF_ADDRESS} setApprovalForAll(address,bool) ${SETTLEMENT_ADDRESS} true --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 100000`;
        await this.executeCommand(approveSettlementCmd, "授权清算合约管理代币");
        
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
        
        // 1. 增加nonce
        const nonceCmd = `cast send ${EXCHANGE_ADDRESS} incrementNonce() --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 100000`;
        await this.executeCommand(nonceCmd, "增加nonce");
        
        // 2. 创建买入订单
        const order = {
            salt: ethers.getBigInt(ethers.hexlify(ethers.randomBytes(32))),
            maker: wallet.address,
            taker: ethers.ZeroAddress,
            tokenId: this.yesTokenId,
            makerAmount: ethers.parseEther("50"),  // 50 USDC
            takerAmount: ethers.parseEther("25"),  // 25 YES tokens
            expiration: Math.floor(Date.now() / 1000) + 3600,
            nonce: 10, // 使用新的nonce
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
        
        console.log("\n买入订单信息:");
        console.log("- 买入数量:", ethers.formatEther(order.takerAmount), "YES代币");
        console.log("- 支付数量:", ethers.formatEther(order.makerAmount), "USDC");
        console.log("- 订单nonce:", order.nonce);
        
        // 3. 执行买入订单
        const orderData = `(${order.salt},${order.maker},${order.taker},${order.tokenId},${order.makerAmount},${order.takerAmount},${order.expiration},${order.nonce},${order.feeRateBps},${order.side},${signature})`;
        const buyCmd = `cast send ${EXCHANGE_ADDRESS} fillOrder\\(\\uint256,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint8,bytes\\),uint256\\) ${orderData} ${ethers.parseEther("25")} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 2000000`;
        await this.executeCommand(buyCmd, "执行买入订单");
        
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
        
        const outcomeValue = outcome === "YES" ? 0 : 1;
        
        // 设置市场结果
        const settleCmd = `cast send ${SETTLEMENT_ADDRESS} setMarketResult\\(bytes32,uint256\\) ${this.conditionId} ${outcomeValue} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 1000000`;
        await this.executeCommand(settleCmd, `设置市场结果为${outcome}`);
        
        if (outcome === "YES") {
            console.log("- YES代币获胜，可以1:1兑换USDC");
            console.log("- NO代币失效，价值为0");
        } else {
            console.log("- NO代币获胜，可以1:1兑换USDC");
            console.log("- YES代币失效，价值为0");
        }
        
        return {
            outcome: outcome,
            outcomeValue: outcomeValue,
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
        const checkBalanceCmd = `cast call ${CTF_ADDRESS} balanceOf\\(address,uint256\\) ${wallet.address} ${winningTokenId} --rpc-url ${RPC_URL}`;
        await this.executeCommand(checkBalanceCmd, "检查获胜代币余额");
        
        // 2. 向清算合约存入抵押品
        const depositCmd = `cast send ${USDC_ADDRESS} transfer\\(address,uint256\\) ${SETTLEMENT_ADDRESS} ${ethers.parseEther("100")} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 100000`;
        await this.executeCommand(depositCmd, "向清算合约存入抵押品");
        
        // 3. 兑换获胜代币为USDC
        const redeemCmd = `cast send ${SETTLEMENT_ADDRESS} redeemTokens\\(uint256,uint256\\) ${winningTokenId} ${ethers.parseEther("25")} --rpc-url ${RPC_URL} --private-key ${PRIVATE_KEY} --gas-limit 1000000`;
        await this.executeCommand(redeemCmd, "兑换获胜代币为USDC");
        
        // 4. 检查最终USDC余额
        const checkUSDCCmd = `cast call ${USDC_ADDRESS} balanceOf\\(address\\) ${wallet.address} --rpc-url ${RPC_URL}`;
        await this.executeCommand(checkUSDCCmd, "检查最终USDC余额");
        
        return {
            winningTokenId: winningTokenId,
            losingTokenId: losingTokenId,
            outcome: outcome
        };
    }

    // 生成完整的演示脚本
    async generateCompleteDemo() {
        console.log("🚀 预测市场完整流程演示");
        console.log("==============================");
        console.log("使用现有的OpenZeppelin ERC1155 CTF合约");
        console.log("CTF地址:", CTF_ADDRESS);
        console.log("Exchange地址:", EXCHANGE_ADDRESS);
        console.log("USDC地址:", USDC_ADDRESS);
        console.log("清算合约地址:", SETTLEMENT_ADDRESS);
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
        
        console.log("\n📋 所有交易哈希记录:");
        console.log("=====================");
        this.transactionHashes.forEach((tx, index) => {
            console.log(`${index + 1}. ${tx.description}: ${tx.hash}`);
        });
        
        return {
            market: market,
            buyOrder: buyOrder,
            settlement: settlement,
            redemption: redemption,
            transactionHashes: this.transactionHashes
        };
    }
}

// 运行演示
async function runCompleteDemo() {
    const demo = new CompletePredictionMarketDemo();
    await demo.generateCompleteDemo();
}

// 如果直接运行此文件
if (require.main === module) {
    runCompleteDemo().catch(console.error);
}

module.exports = CompletePredictionMarketDemo;
