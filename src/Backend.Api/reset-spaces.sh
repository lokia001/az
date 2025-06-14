#!/bin/bash

# Script để xóa dữ liệu cũ và thêm lại từ đầu
# Sử dụng khi muốn reset dữ liệu

echo "====================================================="
echo "Đang xóa dữ liệu cũ và thêm lại dữ liệu mới..."
echo "====================================================="

# Tạo file SQL tạm thời cho việc xóa dữ liệu
cat > temp_delete.sql << EOF
-- Xóa dữ liệu liên quan đến Spaces đã thêm
DELETE FROM "SpaceSystemSpaceServices" WHERE "SpaceId" IN (
    '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
    'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
    'c7c9b8a7-65e4-4387-91d7-f3cf98912021',
    'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a',
    'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0',
    'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4',
    '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
    '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b'
);

DELETE FROM "SpaceSystemAmenities" WHERE "SpaceId" IN (
    '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
    'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
    'c7c9b8a7-65e4-4387-91d7-f3cf98912021',
    'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a',
    'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0',
    'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4',
    '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
    '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b'
);

DELETE FROM "SpaceImages" WHERE "SpaceId" IN (
    '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
    'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
    'c7c9b8a7-65e4-4387-91d7-f3cf98912021',
    'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a',
    'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0',
    'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4',
    '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
    '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b'
);

DELETE FROM "Spaces" WHERE "Id" IN (
    '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
    'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
    'c7c9b8a7-65e4-4387-91d7-f3cf98912021',
    'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a',
    'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0',
    'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4',
    '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
    '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b'
);
EOF

# Chạy script xóa dữ liệu
sqlite3 app_development.db < temp_delete.sql

# Chạy script thêm dữ liệu mới
sqlite3 app_development.db < seed-spaces.sql

# Xóa file tạm
rm temp_delete.sql

# Kiểm tra kết quả
echo -e "\n====================================================="
echo "Danh sách Spaces đã thêm:"
echo "====================================================="
sqlite3 app_development.db "SELECT Id, Name, Type FROM Spaces WHERE Id IN (
    '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
    'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
    'c7c9b8a7-65e4-4387-91d7-f3cf98912021',
    'd5e4f3a2-b1c0-4d7a-9e8b-0f1e2d3c4b5a',
    'e2e3e4e5-c6c7-4a4b-b2b3-a5a6a7a8a9a0',
    'f9f8f7f6-e5e4-d3d2-c1b0-a9a8a7a6a5a4',
    '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    '1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
    '2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a',
    '3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b'
);"

echo -e "\n====================================================="
echo "Kiểm tra hình ảnh đã thêm:"
echo "====================================================="
sqlite3 app_development.db "SELECT s.Name, i.IsCoverImage, substr(i.ImageUrl, 1, 60) || '...' FROM SpaceImages i JOIN Spaces s ON i.SpaceId = s.Id WHERE s.Id IN (
    '5a84d4a1-3f4e-4868-80f2-2aca290f6e28',
    'b329cde5-5f9a-4a4c-925a-fc3a66f252e2',
    'c7c9b8a7-65e4-4387-91d7-f3cf98912021'
);"

echo -e "\n====================================================="
echo "Kiểm tra liên kết với Amenity và Service:"
echo "====================================================="
sqlite3 app_development.db "
SELECT 'Amenities: ' || s.Name as Info, COUNT(sa.SystemAmenityId) as Count
FROM Spaces s
LEFT JOIN SpaceSystemAmenities sa ON s.Id = sa.SpaceId
WHERE s.Id IN ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', 'b329cde5-5f9a-4a4c-925a-fc3a66f252e2', 'c7c9b8a7-65e4-4387-91d7-f3cf98912021')
GROUP BY s.Name
UNION ALL
SELECT 'Services: ' || s.Name, COUNT(ss.SystemSpaceServiceId)
FROM Spaces s
LEFT JOIN SpaceSystemSpaceServices ss ON s.Id = ss.SpaceId
WHERE s.Id IN ('5a84d4a1-3f4e-4868-80f2-2aca290f6e28', 'b329cde5-5f9a-4a4c-925a-fc3a66f252e2', 'c7c9b8a7-65e4-4387-91d7-f3cf98912021')
GROUP BY s.Name
ORDER BY Info;"

echo -e "\n====================================================="
echo "Hoàn tất! Đã xóa dữ liệu cũ và thêm lại 10 bản ghi Space với hình ảnh."
echo "====================================================="
