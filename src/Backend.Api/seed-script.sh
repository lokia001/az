#!/bin/bash

# Tạo dữ liệu giả cho amenity và space-service
# Script này sẽ thêm 10 bản ghi cho mỗi loại vào database

echo "====================================================="
echo "Bắt đầu thêm dữ liệu SystemAmenity và SystemSpaceService"
echo "====================================================="

# Chạy script SQL
sqlite3 app_development.db < seed-amenity-service-final.sql

# Kiểm tra kết quả
echo -e "\n====================================================="
echo "Kiểm tra dữ liệu SystemAmenity đã thêm:"
echo "====================================================="
sqlite3 app_development.db "SELECT Id, Name, Description FROM SystemAmenities;"

echo -e "\n====================================================="
echo "Kiểm tra dữ liệu SystemSpaceService đã thêm:"
echo "====================================================="
sqlite3 app_development.db "SELECT Id, Name, Description FROM SystemSpaceServices;"

echo -e "\n====================================================="
echo "Hoàn tất! Đã thêm 10 bản ghi cho mỗi loại."
echo "====================================================="
