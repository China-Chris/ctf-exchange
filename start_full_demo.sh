#!/bin/bash

echo "🚀 启动完整预测市场Demo"
echo "========================"
echo ""
echo "包含功能："
echo "1. 交互式网页演示"
echo "2. 真实USDC领取API"
echo "3. 智能合约交互"
echo ""

# 检查依赖
echo "检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js"
    echo "在macOS上: brew install node"
    echo "在Ubuntu上: sudo apt-get install nodejs npm"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ 未找到Python3，请先安装Python3"
    echo "在macOS上: brew install python3"
    echo "在Ubuntu上: sudo apt-get install python3"
    exit 1
fi

# 检查npm包
echo "检查npm包..."
if [ ! -d "node_modules" ]; then
    echo "安装npm依赖..."
    npm install express cors ethers
fi

echo "✅ 依赖检查完成"
echo ""

# 启动USDC API服务器
echo "启动USDC领取API服务器..."
node usdc_api.js &
API_PID=$!

# 等待API服务器启动
sleep 3

# 检查API服务器是否启动成功
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ USDC API服务器启动成功 (端口3001)"
else
    echo "❌ USDC API服务器启动失败"
    kill $API_PID 2>/dev/null
    exit 1
fi

echo ""
echo "启动网页服务器..."
echo "请选择要启动的版本："
echo "1. 交互式演示 (推荐) - 可以一步步点击操作，支持真实USDC领取"
echo "2. 静态展示 - 查看完整流程和交易记录"
echo ""
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        echo "启动交互式演示..."
        echo "网页地址: http://localhost:8000/interactive_demo.html"
        echo "USDC API: http://localhost:3001"
        echo ""
        echo "功能说明："
        echo "- 输入钱包地址领取真实USDC"
        echo "- 一步步点击操作完整流程"
        echo "- 实时余额更新和交易记录"
        echo ""
        echo "按Ctrl+C停止所有服务"
        echo ""
        python3 -m http.server 8000
        ;;
    2)
        echo "启动静态展示..."
        echo "网页地址: http://localhost:8000/index.html"
        echo "USDC API: http://localhost:3001"
        echo ""
        echo "按Ctrl+C停止所有服务"
        echo ""
        python3 -m http.server 8000
        ;;
    *)
        echo "无效选择，启动交互式演示..."
        echo "网页地址: http://localhost:8000/interactive_demo.html"
        echo "USDC API: http://localhost:3001"
        echo ""
        echo "按Ctrl+C停止所有服务"
        echo ""
        python3 -m http.server 8000
        ;;
esac

# 清理函数
cleanup() {
    echo ""
    echo "正在停止服务..."
    kill $API_PID 2>/dev/null
    echo "✅ 所有服务已停止"
    exit 0
}

# 捕获Ctrl+C信号
trap cleanup SIGINT SIGTERM


