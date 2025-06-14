#!/bin/bash

# Tạo dữ liệu giả cho spaces và hình ảnh
# Script này sẽ thêm 10 bản ghi Space kèm hình ảnh vào database

echo "====================================================="
echo "Bắt đầu thêm dữ liệu Spaces và SpaceImages"
echo "====================================================="

# Chạy script SQL
sqlite3 app_development.db < seed-spaces.sql

# Kiểm tra kết quả
echo -e "\n====================================================="
echo "Danh sách Spaces đã thêm:"
echo "====================================================="
sqlite3 app_development.db "SELECT Id, Name, Type FROM Spaces WHERE Name IN ('Urban Coworking Studio', 'Harmony Meeting Room', 'Green Garden Event Space', 'Creative Studio Loft', 'Tech Conference Room', 'Serenity Yoga Studio', 'Culinary Workshop Kitchen', 'Vintage Recording Studio', 'Panorama Rooftop Terrace', 'Quiet Study Library');"

echo -e "\n====================================================="
echo "Kiểm tra hình ảnh đã thêm:"
echo "====================================================="
sqlite3 app_development.db "SELECT s.Name, i.IsCoverImage, i.ImageUrl FROM SpaceImages i JOIN Spaces s ON i.SpaceId = s.Id WHERE s.Name IN ('Urban Coworking Studio', 'Harmony Meeting Room', 'Green Garden Event Space', 'Creative Studio Loft', 'Tech Conference Room', 'Serenity Yoga Studio', 'Culinary Workshop Kitchen', 'Vintage Recording Studio', 'Panorama Rooftop Terrace', 'Quiet Study Library');"

echo -e "\n====================================================="
echo "Kiểm tra liên kết với SystemAmenity:"
echo "====================================================="
sqlite3 app_development.db "
SELECT s.Name as Space, a.Name as Amenity 
FROM SpaceSystemAmenities sa 
JOIN Spaces s ON sa.SpaceId = s.Id 
JOIN SystemAmenities a ON sa.SystemAmenityId = a.Id
WHERE s.Name IN ('Urban Coworking Studio', 'Harmony Meeting Room', 'Green Garden Event Space')
ORDER BY s.Name;"

echo -e "\n====================================================="
echo "Kiểm tra liên kết với SystemSpaceService:"
echo "====================================================="
sqlite3 app_development.db "
SELECT s.Name as Space, ss.Name as Service, sss.IsIncludedInBasePrice, sss.Notes, sss.PriceOverride
FROM SpaceSystemSpaceServices sss
JOIN Spaces s ON sss.SpaceId = s.Id 
JOIN SystemSpaceServices ss ON sss.SystemSpaceServiceId = ss.Id
WHERE s.Name IN ('Urban Coworking Studio', 'Harmony Meeting Room', 'Green Garden Event Space')
ORDER BY s.Name;"

echo -e "\n====================================================="
echo "Hoàn tất! Đã thêm 10 bản ghi Space và hình ảnh tương ứng."
echo "====================================================="
