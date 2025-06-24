#!/bin/bash

# Script để chạy và cập nhật dữ liệu mẫu (seeding).
# Script này nên được chạy từ thư mục gốc của dự án.

set -e # Thoát ngay nếu có lỗi

echo "--- Starting Database Seeder ---"

# Lấy đường dẫn của script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# Đường dẫn đến thư mục gốc của dự án (giả sử scripts nằm trong thư mục con của root)
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/..")

# Đường dẫn đến project Backend.Api
API_PROJECT_PATH="$PROJECT_ROOT/src/Backend.Api"

if [ ! -d "$API_PROJECT_PATH" ]; then
    echo "Error: API project directory not found at '$API_PROJECT_PATH'."
    exit 1
fi

echo "Project root found at: $PROJECT_ROOT"
echo "Running seeder for project: $API_PROJECT_PATH"

# Thực thi lệnh dotnet run với tham số 'seed-data'
# Tham số này sẽ kích hoạt logic seed trong Program.cs
dotnet run --project "$API_PROJECT_PATH" -- seed-data

echo "--- Database Seeder finished successfully. ---"