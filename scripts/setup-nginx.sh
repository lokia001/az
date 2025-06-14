#!/bin/bash

# Script để cài đặt cấu hình Nginx đúng
# Đặt tên file này là setup-nginx.sh

# Đảm bảo script chạy với quyền root
if [ "$(id -u)" != "0" ]; then
   echo "Script này phải chạy với quyền root (sudo)" 
   exit 1
fi

# Kiểm tra Nginx đã được cài đặt chưa
if ! command -v nginx &> /dev/null; then
    echo "Nginx không được tìm thấy. Đang cài đặt..."
    apt-get update
    apt-get install -y nginx
fi

# Vô hiệu hóa cấu hình mặc định
if [ -f /etc/nginx/sites-enabled/default ]; then
    echo "Vô hiệu hóa cấu hình Nginx mặc định..."
    rm /etc/nginx/sites-enabled/default
fi

# Sao chép file cấu hình working.conf
echo "Sao chép file cấu hình của dự án..."
cp /home/h-user/Downloads/0_DA-20250509T015437Z-001/0_DA/1.PJ/az/nginx/working.conf /etc/nginx/sites-available/

# Tạo symlink để kích hoạt site
if [ ! -f /etc/nginx/sites-enabled/working.conf ]; then
    ln -s /etc/nginx/sites-available/working.conf /etc/nginx/sites-enabled/
fi

# Kiểm tra cấu hình Nginx
echo "Kiểm tra cấu hình Nginx..."
nginx -t

# Nếu kiểm tra thành công, khởi động lại Nginx
if [ $? -eq 0 ]; then
    echo "Cấu hình Nginx đúng. Khởi động lại dịch vụ..."
    systemctl restart nginx
    echo "Hoàn tất!"
else
    echo "Cấu hình Nginx có lỗi. Vui lòng kiểm tra file cấu hình."
    exit 1
fi

# Kiểm tra dịch vụ backend
echo "Kiểm tra dịch vụ backend trên port 5000..."
if netstat -tuln | grep -q ":5000 "; then
    echo "Dịch vụ backend đang chạy trên port 5000."
else
    echo "CẢNH BÁO: Không tìm thấy dịch vụ nào đang chạy trên port 5000!"
    echo "Bạn cần đảm bảo backend API đang chạy để Nginx có thể proxy các request."
    echo "Sử dụng lệnh sau để chạy backend API:"
    echo "cd /home/h-user/Downloads/0_DA-20250509T015437Z-001/0_DA/1.PJ/az/src/Backend.Api && dotnet run --launch-profile Production"
fi
