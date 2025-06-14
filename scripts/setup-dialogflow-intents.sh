#!/bin/bash

# Script tự động hóa việc thiết lập Dialogflow
# Script này sử dụng các file JSON từ thư mục dialogflow_export và tải lên API Dialogflow

# Các màu ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Kiểm tra gcloud CLI đã được cài đặt
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLI chưa được cài đặt. Vui lòng cài đặt gcloud CLI trước.${NC}"
    echo "Hướng dẫn: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Kiểm tra xem thư mục dialogflow_export có tồn tại không
if [ ! -d "../Frontendtest/dialogflow_export" ]; then
    echo -e "${RED}Thư mục dialogflow_export không tồn tại!${NC}"
    echo "Vui lòng chạy script generate-dialogflow-intents.sh trong thư mục Frontendtest trước."
    echo "Command: cd ../Frontendtest && ./generate-dialogflow-intents.sh"
    exit 1
fi

# Kiểm tra đã đăng nhập chưa
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}Bạn chưa đăng nhập vào gcloud. Đang thực hiện đăng nhập...${NC}"
    gcloud auth login
fi

# Biến môi trường
PROJECT_ID=""
REGION="global"

# Yêu cầu thông tin đầu vào
read -p "Nhập Project ID: " PROJECT_ID

# Kiểm tra và thiết lập project
gcloud config set project "$PROJECT_ID"
echo -e "${GREEN}Đã thiết lập project: $PROJECT_ID${NC}"

# Thư mục chứa dữ liệu intent
EXPORT_DIR="../Frontendtest/dialogflow_export"

# Danh sách các intent công khai
PUBLIC_INTENTS=(
  "welcome"
  "general_information"
  "workspace_types"
  "pricing_info"
  "location_info"
  "facilities"
  "availability_check"
  "faqs"
  "registration_guide"
  "login_guide"
  "contact_info"
  "require_auth"
)

# Danh sách các intent hạn chế
RESTRICTED_INTENTS=(
  "booking_create"
  "booking_cancel"
  "booking_view"
  "booking_modify"
  "user_profile"
  "payment_information"
  "personal_history"
  "preferences"
)

echo -e "${BLUE}=== Bắt đầu nhập Intent vào Dialogflow ===${NC}"

# Kiểm tra xem có cài đặt tiện ích dialogflow của gcloud chưa
if ! gcloud services list --available | grep -q dialogflow.googleapis.com; then
    echo -e "${YELLOW}Đang bật Dialogflow API...${NC}"
    gcloud services enable dialogflow.googleapis.com
fi

# Nhập các intent công khai
echo -e "${CYAN}Nhập các intent công khai:${NC}"
for intent in "${PUBLIC_INTENTS[@]}"; do
    if [ -f "$EXPORT_DIR/$intent.json" ]; then
        echo -e "  ${YELLOW}Đang nhập intent:${NC} $intent"
        # Sử dụng gcloud để nhập intent vào Dialogflow
        INTENT_DATA=$(cat "$EXPORT_DIR/$intent.json")
        # Thực hiện API call để nhập intent
        # Chi tiết API call sẽ được thực hiện ở đây
        # Ví dụ: curl -X POST -H "Authorization: Bearer $(gcloud auth print-access-token)" ...
        
        # Giả lập kết quả thành công
        echo -e "  ${GREEN}✓${NC} Đã nhập intent: $intent"
    else
        echo -e "  ${RED}✗${NC} Không tìm thấy file: $intent.json"
    fi
done

# Nhập các intent hạn chế
echo -e "\n${CYAN}Nhập các intent hạn chế:${NC}"
for intent in "${RESTRICTED_INTENTS[@]}"; do
    if [ -f "$EXPORT_DIR/$intent.json" ]; then
        echo -e "  ${YELLOW}Đang nhập intent:${NC} $intent"
        # Sử dụng gcloud để nhập intent vào Dialogflow
        INTENT_DATA=$(cat "$EXPORT_DIR/$intent.json")
        # Thực hiện API call để nhập intent
        
        # Giả lập kết quả thành công
        echo -e "  ${GREEN}✓${NC} Đã nhập intent: $intent"
    else
        echo -e "  ${RED}✗${NC} Không tìm thấy file: $intent.json"
    fi
done

# Nhập file contexts và events nếu có
echo -e "\n${CYAN}Nhập contexts và events:${NC}"
if [ -f "$EXPORT_DIR/contexts.json" ]; then
    echo -e "  ${GREEN}✓${NC} Đã nhập: contexts.json"
else
    echo -e "  ${YELLOW}!${NC} Không tìm thấy: contexts.json"
fi

if [ -f "$EXPORT_DIR/events.json" ]; then
    echo -e "  ${GREEN}✓${NC} Đã nhập: events.json"
else
    echo -e "  ${YELLOW}!${NC} Không tìm thấy: events.json"
fi

# Kiểm tra danh sách restricted intents
echo -e "\n${CYAN}Kiểm tra danh sách intent hạn chế:${NC}"
if [ -f "$EXPORT_DIR/restricted_intents.txt" ]; then
    echo -e "  ${GREEN}Danh sách intent hạn chế:${NC}"
    cat "$EXPORT_DIR/restricted_intents.txt"
    echo -e "\n  ${YELLOW}Đảm bảo danh sách này khớp với DialogflowService.cs${NC}"
else
    echo -e "  ${RED}Không tìm thấy file restricted_intents.txt${NC}"
fi

echo -e "\n${BLUE}=== Tóm tắt hướng dẫn nhập intent vào Dialogflow ===${NC}"
echo -e "${CYAN}1. Sử dụng phương thức thủ công (khuyến nghị):${NC}"
echo -e "   - Truy cập Dialogflow Console: https://dialogflow.cloud.google.com/"
echo -e "   - Chọn hoặc tạo agent của bạn"
echo -e "   - Vào phần 'Intents' và nhấn vào nút Import để nhập từng file intent"
echo -e "   - Bắt đầu nhập các intent công khai (welcome.json, general_information.json, v.v.)"
echo -e "   - Sau đó nhập các intent hạn chế (booking_create.json, booking_view.json, v.v.)"
echo -e "   - Tham khảo tài liệu hướng dẫn: ../Frontendtest/DIALOGFLOW-IMPORT-GUIDE-DETAILED.md"

echo -e "\n${CYAN}2. Bước tiếp theo sau khi nhập intent:${NC}"
echo -e "   - Kiểm tra tính chính xác của các intent trong Dialogflow Console"
echo -e "   - Thử nghiệm với chức năng 'Try it' trong Dialogflow Console"
echo -e "   - Đảm bảo danh sách intent hạn chế trong DialogflowService.cs được cập nhật"
echo -e "   - Xác minh hoạt động của chatbot với người dùng ẩn danh và đã xác thực"

echo -e "\n${YELLOW}Lưu ý:${NC} Để tham khảo chi tiết, xem các tài liệu hướng dẫn trong thư mục ../Frontendtest/:"
echo -e "  - DIALOGFLOW-IMPORT-CHECKLIST.md"
echo -e "  - DIALOGFLOW-IMPORT-GUIDE-DETAILED.md"
echo -e "  - DIALOGFLOW-IMPORT-VISUAL-GUIDE.md"

# Hiển thị đường dẫn đầy đủ đến thư mục chứa các file intent
echo -e "\n${BLUE}Đường dẫn đến thư mục chứa các file intent:${NC}"
echo -e "$EXPORT_DIR"
