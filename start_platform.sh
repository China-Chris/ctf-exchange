#!/bin/bash

echo "🚀 启动预测市场平台"
echo "=================="

# 检查API服务器是否运行
if pgrep -f "node usdc_api.js" > /dev/null; then
    echo "✅ API服务器已在运行"
else
    echo "🔄 启动API服务器..."
    node usdc_api.js &
    sleep 3
fi

# 检查Web服务器是否运行
if pgrep -f "python3 -m http.server" > /dev/null; then
    echo "✅ Web服务器已在运行"
else
    echo "🔄 启动Web服务器..."
    python3 -m http.server 8000 &
    sleep 2
fi

echo ""
echo "🎯 预测市场平台已启动！"
echo "======================"
echo ""
echo "📱 访问地址:"
echo "   主平台: http://localhost:8000/prediction_market_platform.html"
echo "   旧演示: http://localhost:8000/interactive_demo.html"
echo ""
echo "🔑 登录信息:"
echo "   用户登录: 输入任意钱包地址"
echo "   管理员登录: 密码 'admin123'"
echo ""
echo "⚙️ API接口:"
echo "   健康检查: http://localhost:3001/api/health"
echo "   市场列表: http://localhost:3001/api/markets"
echo "   创建市场: POST http://localhost:3001/api/create-market"
echo ""
echo "💡 功能说明:"
echo "   👤 用户: 查看市场、交易代币、管理资产"
echo "   👨‍💼 管理员: 创建市场、设置结果、系统管理"
echo ""
echo "🛑 停止服务:"
echo "   pkill -f 'node usdc_api.js'"
echo "   pkill -f 'python3 -m http.server'"
echo ""
echo "=========================================="


