#!/bin/bash

echo "🚀 Bắt đầu dọn dẹp và cập nhật lại toàn bộ mã nguồn..."

# 1. Bỏ qua các thay đổi rác trên VPS và kéo code mới nhất
echo "📦 Đang kéo code mới nhất từ Github..."
git reset --hard HEAD
git clean -fd
git pull origin master

# 2. Xoá sạch bộ nhớ đệm (cache) của Next.js
echo "🧹 Đang xoá sạch cache cũ..."
rm -rf .next
rm -rf node_modules
npm cache clean --force

# 3. Cài đặt lại thư viện
echo "⚙️ Đang cài đặt lại thư viện..."
npm install

# 4. Build lại project (Next.js)
echo "🏗️ Đang Build lại mã nguồn (Quá trình này có thể mất vài phút)..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build thành công! Đang khởi động lại PM2..."
    pm2 restart bomrau
    echo "🎉 Mọi thứ đã hoàn tất! Hãy tải lại trang web (F5) và thử lại."
else
    echo "❌ Build thất bại! VPS của bạn có thể bị tràn RAM hoặc thiếu bộ nhớ."
    echo "Hãy copy toàn bộ lỗi hiển thị trên màn hình và gửi cho tôi để tôi xử lý!"
fi
