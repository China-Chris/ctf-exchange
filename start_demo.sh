#!/bin/bash

echo "🚀 启动预测市场Demo网页"
echo "========================"
echo ""
echo "请选择要启动的版本："
echo "1. 交互式演示 (推荐) - 可以一步步点击操作"
echo "2. 静态展示 - 查看完整流程和交易记录"
echo ""
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        echo "启动交互式演示..."
        echo "网页地址: http://localhost:8000/interactive_demo.html"
        echo "按Ctrl+C停止服务器"
        echo ""
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            echo "❌ 未找到Python，请手动打开interactive_demo.html文件"
        fi
        ;;
    2)
        echo "启动静态展示..."
        echo "网页地址: http://localhost:8000/index.html"
        echo "按Ctrl+C停止服务器"
        echo ""
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            echo "❌ 未找到Python，请手动打开index.html文件"
        fi
        ;;
    *)
        echo "无效选择，启动交互式演示..."
        echo "网页地址: http://localhost:8000/interactive_demo.html"
        echo "按Ctrl+C停止服务器"
        echo ""
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m SimpleHTTPServer 8000
        else
            echo "❌ 未找到Python，请手动打开interactive_demo.html文件"
        fi
        ;;
esac
