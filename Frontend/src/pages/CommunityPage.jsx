import React, { useState, useEffect, useRef, useCallback } from 'react';

// =======================================================================
// BƯỚC 1: HÀM HELPER ĐỂ XÂY DỰNG CÂY COMMENT TỪ DỮ LIỆU PHẲNG
// =======================================================================
const buildCommentTree = (commentsList, parentId = null) => {
    const tree = [];
    if (!commentsList || commentsList.length === 0) {
        return tree;
    }

    commentsList.forEach(comment => {
        if (comment.parentId === parentId) {
            // Tìm các replies cho comment hiện tại
            const replies = buildCommentTree(commentsList, comment.id); // Tìm reply của comment hiện tại
            if (replies.length) {
                comment.replies = replies; // Gán mảng replies vào comment cha
            } else {
                comment.replies = []; // Đảm bảo luôn có mảng replies (có thể rỗng)
            }
            tree.push(comment);
        }
    });
    return tree;
};

// =======================================================================
// KẾT THÚC HÀM HELPER
// =======================================================================
const AVATAR_DIMENSION = 32; // Kích thước avatar (width và height)
const AVATAR_MARGIN_RIGHT = 8;
const REPLY_FORM_EXTRA_INDENT = 8;

// --- PHẦN STYLES (Cập nhật và thêm style cho resize handle) ---
const baseTextColor = '#E4E6EB';
const secondaryTextColor = '#B0B3B8';
const darkBg = '#18191A';
const cardBg = '#242526';
const hoverBg = '#3A3B3C'; // Dùng cho hover các item
const activeBg = '#303132'; // Dùng cho active/focus
const primaryBlue = '#2374E1';
const borderColor = '#3E4042';

const iconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
};


const styles = {
    commentAuthorAvatar: {
        width: `${AVATAR_DIMENSION}px`,
        height: `${AVATAR_DIMENSION}px`,
        borderRadius: '50%',
        marginRight: `${AVATAR_MARGIN_RIGHT}px`,
    },
    replyInputSection: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '8px',
        // paddingLeft: '40px', // (32px avatar comment cha + 8px margin) + thêm chút nữa nếu muốn thụt vào
        // Hoặc để nó cùng cấp với comment cha:
        paddingLeft: `calc(${AVATAR_DIMENSION}px + ${AVATAR_MARGIN_RIGHT}px + ${REPLY_FORM_EXTRA_INDENT}px)`,
        // Thụt vào bằng khoảng avatar + margin của comment được reply
    },
    replyPostButton: {
        marginLeft: '8px',
        padding: '6px 12px',
        backgroundColor: primaryBlue, // Hoặc styles.colors.primaryBlue
        color: 'white',
        border: 'none',
        borderRadius: '18px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        // ':disabled': { backgroundColor: '#ccc' } // Khó làm với inline
    },
    commentLikesCount: {
        fontSize: '12px',
        color: secondaryTextColor, // Hoặc styles.colors.secondaryTextColor
        marginLeft: '4px', // Khoảng cách với chữ "Like"
    },
    toggleRepliesButton: {
        fontSize: '12px',
        fontWeight: '600',
        color: secondaryTextColor, // Hoặc styles.colors.secondaryTextColor
        cursor: 'pointer',
        marginTop: '5px',
        paddingLeft: '12px', // Căn với actions
        display: 'inline-flex', // Để mũi tên nằm cùng hàng
        alignItems: 'center',
        // ':hover': { textDecoration: 'underline' } // Khó làm với inline style
    },

    // commentContent: {
    //     marginLeft: '10px',
    // },
    // commentBubble: {
    //     padding: '10px',
    //     borderRadius: '5px',
    //     color: '#fff',
    // },
    // commentActions: {
    //     fontSize: '12px',
    //     color: '#888',
    // },
    // commentActionLink: {
    //     cursor: 'pointer',
    // },
    dotSeparator: {
        margin: '0 5px',
    },
    commentTimestamp: {
        fontSize: '12px',
        color: '#aaa',
    },
    commentAuthorName: {
        fontWeight: 'bold',
    },
    // commentText: {
    //     fontSize: '14px',
    // },

    // START: STYLES_UPDATE_FOR_COMMENTS
    // ... (các style hiện có) ...
    commentsSection: {
        position: 'relative',
        marginTop: '15px',
        paddingTop: '10px',
        borderTop: `1px solid ${borderColor}`, // Đường kẻ phân cách
    },
    commentInputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
    },
    // commentAuthorAvatar: { // Dùng chung cho avatar người bình luận và ô nhập
    //     width: '32px',
    //     height: '32px',
    //     borderRadius: '50%',
    //     marginRight: '8px',
    //     // flexShrink: 0,
    // },
    commentInputField: {
        flexGrow: 1,
        backgroundColor: hoverBg, // Giống màu search bar
        border: `1px solid ${borderColor}`,
        borderRadius: '18px', // Bo tròn nhiều
        padding: '8px 12px',
        color: baseTextColor,
        fontSize: '14px',
        outline: 'none',
        '::placeholder': { // CSS cho placeholder, có thể không hoạt động hoàn hảo với inline style
            color: secondaryTextColor,
        }
    },
    commentItem: {
        marginTop: '10px',
    },
    commentContent: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    commentBubble: {
        backgroundColor: hoverBg, // Nền cho bong bóng chat
        padding: '8px 12px',
        borderRadius: '18px', // Bo tròn nhiều
        display: 'inline-block', // Để bubble co lại theo nội dung
        maxWidth: 'fit-content', // Giới hạn chiều rộng tối đa
        wordBreak: 'break-word', // Xuống dòng nếu text dài
    },
    // commentAuthorName: {
    //     fontWeight: '600',
    //     color: baseTextColor,
    //     fontSize: '13px',
    //     display: 'block', // Để tên ở một dòng riêng nếu muốn
    //     marginBottom: '2px',
    // },
    commentText: {
        margin: 0,
        lineHeight: '1.4',
        color: baseTextColor,
    },
    commentActions: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '12px',
        color: secondaryTextColor,
        paddingLeft: '12px', // Căn với nội dung bubble
        marginTop: '4px',
    },
    commentActionLink: {
        cursor: 'pointer',
        fontWeight: '500',
        // ':hover': { textDecoration: 'underline' }
    },
    // commentTimestamp: {
    //     // marginLeft: 'auto', // Đẩy timestamp sang phải nếu muốn
    // },
    repliesContainer: {
        marginTop: '8px',
        paddingLeft: '10px', // Thụt lề cho replies
        // borderLeft: `2px solid ${borderColor}`, // Có thể thêm đường kẻ dọc cho replies
    },
    noCommentsText: {
        color: secondaryTextColor,
        fontSize: '14px',
        textAlign: 'center',
        padding: '10px 0',
    },
    // END: STYLES_UPDATE_FOR_COMMENTS

    // START: STYLES_UPDATE_FOR_REACTIONS
    // ... (các style hiện có) ...
    reactionTooltip: {
        position: 'fixed', // Hoặc 'absolute' nếu pageContainer là relative và overflow hidden
        backgroundColor: '#FFFFFF', // Nền trắng cho tooltip
        borderRadius: '20px', // Bo tròn nhiều
        padding: '4px 8px',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        zIndex: 1000, // Đảm bảo tooltip ở trên cùng
        transition: 'opacity 0.1s ease-in-out, transform 0.1s ease-in-out', // Hiệu ứng xuất hiện
        // transform: 'translateY(-10px)', // Hiệu ứng trượt nhẹ lên khi xuất hiện
        // opacity: 0, // Sẽ được set là 1 khi visible, nhưng với inline style khó làm animation này
    },
    reactionButtonInTooltip: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '6px',
        margin: '0 2px',
        outline: 'none',
    },
    reactionIconInTooltip: {
        fontSize: '24px', // Kích thước icon trong tooltip
        display: 'inline-block',
        transition: 'transform 0.1s ease-in-out', // Hiệu ứng cho hover
    },
    // Bạn có thể thêm style cho nút actionButton khi active với màu cụ thể
    // Ví dụ:
    // actionButtonActiveLove: {
    //   color: REACTIONS.find(r => r.name === 'Love').color,
    //   fontWeight: 'bold',
    // },
    // END: STYLES_UPDATE_FOR_REACTIONS


    pageContainer: {
        display: 'flex',
        height: '100vh', // Quan trọng để sidebar và content có chiều cao đầy đủ
        backgroundColor: darkBg,
        color: baseTextColor,
        fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
        overflow: 'hidden', // Ngăn scroll toàn trang khi sidebar scroll
    },
    // --- Left Sidebar Styles ---
    leftSidebar: {
        // width đã được set động
        height: '100%',
        backgroundColor: cardBg,
        display: 'flex', // Để handle nằm cạnh content
        flexDirection: 'row', // Handle bên phải
        position: 'relative', // Để resizeHandle định vị tuyệt đối
        flexShrink: 0, // Quan trọng để sidebar không bị co lại bởi content
        borderRight: `1px solid ${borderColor}`, // Đường viền giữa sidebar và content
    },
    sidebarContent: { // Wrapper cho nội dung sidebar để nó có thể scroll độc lập
        flexGrow: 1, // Chiếm hết không gian trừ handle
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto', // Cho phép cuộn nếu nội dung dài
        overflowX: 'hidden', // Ngăn cuộn ngang không cần thiết
    },
    resizeHandle: {
        width: '6px', // Vùng kéo rộng hơn 1 chút để dễ nắm bắt
        height: '100%',
        backgroundColor: 'transparent', // Trong suốt, chỉ hiện cursor
        // backgroundColor: '#55585c', // uncomment để thấy handle
        cursor: 'col-resize',
        position: 'absolute', // Nằm trên cạnh phải
        right: '-3px', // Nửa trong nửa ngoài đường border
        top: 0,
        zIndex: 10, // Đảm bảo handle ở trên
        // ':hover': { backgroundColor: primaryBlue } // Khó làm với inline
    },
    sidebarHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px',
        padding: '8px 0',
    },
    searchBarContainer: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: hoverBg,
        borderRadius: '20px',
        padding: '8px 12px',
        flexGrow: 1,
        marginRight: '10px',
    },
    searchInput: {
        flexGrow: 1,
        border: 'none',
        backgroundColor: 'transparent',
        color: baseTextColor,
        fontSize: '15px',
        outline: 'none',
        marginLeft: '8px',
    },
    settingsButton: {
        background: 'transparent',
        border: 'none',
        color: secondaryTextColor,
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // ':hover': { backgroundColor: activeBg }
    },
    sidebarMenu: {
        marginBottom: '20px',
    }, colors: {
        borderColor: '#3E4042', // Màu cho đường nối
        baseTextColor: '#E4E6EB',
        secondaryTextColor: '#B0B3B8',
        commentBubbleBg: '#3A3B3C',
    },
    menuItem: {
        padding: '10px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '500',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // ':hover': { backgroundColor: hoverBg }
        // Thêm transition cho mượt
        transition: 'background-color 0.2s ease-in-out',
    },
    menuItemActive: {
        backgroundColor: primaryBlue,
        color: '#FFFFFF',
    },
    createGroupButton: {
        backgroundColor: primaryBlue,
        color: '#FFFFFF',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '6px',
        width: '100%',
        textAlign: 'center',
        fontSize: '15px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background-color 0.2s ease-in-out',
        // ':hover': { backgroundColor: '#1A64D1' } // Màu xanh đậm hơn khi hover
    },
    joinedGroupsSection: {
        marginTop: '15px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0, // Quan trọng cho flex item có thể scroll bên trong
    },
    joinedGroupsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        paddingRight: '5px', // Để see all không bị che bởi scrollbar
    },
    sectionTitle: {
        fontSize: '17px',
        fontWeight: '600',
        color: baseTextColor,
        margin: 0,
    },
    seeAllLink: {
        color: primaryBlue,
        textDecoration: 'none',
        fontSize: '14px',
        // ':hover': { textDecoration: 'underline' }
    },
    joinedGroupsList: {
        overflowY: 'auto', // Cho phép cuộn danh sách nhóm
        flexGrow: 1,
        paddingRight: '5px', // Tránh scrollbar che nội dung
    },
    groupListItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 4px 8px 0', // Giảm padding trái để không bị cách xa khi có scrollbar
        cursor: 'pointer',
        borderRadius: '6px',
        transition: 'background-color 0.2s ease-in-out',
        // ':hover': { backgroundColor: hoverBg }
    },
    groupIconPlaceholder: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: hoverBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        marginRight: '12px',
        flexShrink: 0,
    },
    groupInfo: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    groupName: {
        fontSize: '15px',
        fontWeight: '500',
        color: baseTextColor,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    groupLastActive: {
        fontSize: '13px',
        color: secondaryTextColor,
    },

    // --- Right Content Area Styles ---
    rightContent: {
        flexGrow: 1, // Quan trọng để content chiếm phần còn lại
        height: '100%',
        padding: '20px 30px',
        overflowY: 'auto', // Cho phép cuộn toàn bộ content
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    contentTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: baseTextColor,
        marginBottom: '20px',
        alignSelf: 'flex-start',
        width: '100%',
        maxWidth: '680px', // Giữ title cùng width với post list
    },
    postList: {
        width: '100%',
        maxWidth: '680px',
    },

    // START: FIX_POST_CARD_STYLE
    postCard: {
        backgroundColor: cardBg,
        borderRadius: '8px',
        marginBottom: '15px',
        padding: '12px 16px',
        border: `1px solid ${borderColor}`,
        display: 'flex', // NẾU CÓ DÒNG NÀY
        flexDirection: 'column', // THÌ PHẢI CÓ DÒNG NÀY
    },
    // END: FIX_POST_CARD_STYLE


    postHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '10px',
    },
    postAuthorInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    postAuthorAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px',
        objectFit: 'cover',
    },
    postAuthorName: { color: baseTextColor, fontWeight: '600', fontSize: '15px' },
    postInGroup: { color: secondaryTextColor, fontSize: '14px' },
    postGroupName: { color: baseTextColor, fontWeight: '500', fontSize: '14px' },
    postMeta: { display: 'flex', alignItems: 'center', color: secondaryTextColor, fontSize: '13px', marginTop: '2px' },
    postVisibility: { marginLeft: '2px' },
    // dotSeparator: { margin: '0 5px', color: secondaryTextColor },
    postTimestamp: {},
    moreButton: {
        background: 'transparent',
        border: 'none',
        color: secondaryTextColor,
        padding: '6px',
        borderRadius: '50%',
        cursor: 'pointer',
        // ':hover': { backgroundColor: hoverBg }
    },
    postBody: { marginBottom: '12px', fontSize: '15px', lineHeight: '1.45', color: baseTextColor, whiteSpace: 'pre-wrap' },
    postMediaContainer: { marginBottom: '10px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${borderColor}` },
    singleMediaImage: { width: '100%', maxHeight: '550px', objectFit: 'cover', display: 'block' },
    multipleMediaLayout: { display: 'flex', gap: '2px', maxHeight: '400px' }, // Giảm gap
    mainMediaImage: { width: '100%', height: '100%', objectFit: 'cover' }, // Để ảnh tự fill
    thumbnailMediaContainer: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    thumbnailMediaImage: { width: '100%', height: '100%', objectFit: 'cover' },
    postActions: {
        // display: 'flex',
        justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `1px solid ${borderColor}`, marginTop: '10px'
    },
    actionButtons: { display: 'flex' },
    actionButton: {
        background: 'transparent',
        border: 'none',
        color: secondaryTextColor,
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s ease-in-out',
        // ':hover': { backgroundColor: activeBg }
    },
    postStats: { fontSize: '14px', color: secondaryTextColor },
};



// --- BẮT ĐẦU ICON PLACEHOLDERS (Thay thế bằng thư viện icon thực tế) ---
const SettingsIcon = () => <span style={iconStyle}>⚙️</span>;
const SearchIcon = () => <span style={{ ...iconStyle, marginRight: '8px' }}>🔍</span>;
const ArrowDownIcon = () => <span style={{ ...iconStyle, fontSize: '10px', marginLeft: '5px' }}>▼</span>;
const GlobeIcon = () => <span style={{ ...iconStyle, fontSize: '12px', marginRight: '4px' }}>🌍</span>;
const MoreHorizIcon = () => <span style={{ ...iconStyle, cursor: 'pointer' }}>...</span>;
const LikeIcon = () => <span style={{ ...iconStyle, marginRight: '5px', fontSize: '18px' }}>👍</span>;
const CommentIcon = () => <span style={{ ...iconStyle, marginRight: '5px', fontSize: '18px' }}>💬</span>;
const ShareIcon = () => <span style={{ ...iconStyle, marginRight: '5px', fontSize: '18px' }}>↪️</span>;
// --- KẾT THÚC ICON PLACEHOLDERS ---

// --- BẮT ĐẦU DỮ LIỆU GIẢ LẬP (Giống như trước) ---
const joinedGroupsData = [
    // { id: 1, icon: '🏀', name: '3X CLUB', lastActive: '38 weeks ago' },
    { id: 2, icon: '📐', name: 'SIMAT 242', lastActive: '7 minutes ago' },
    { id: 3, icon: '⚡', name: 'FAST LEARNING - TIM VU', lastActive: '1 hour ago' },
    { id: 4, icon: '🤖', name: 'Khoa Học Ai - Trí Tuệ Nhân Tạo Cơ Bản - Ứng Dụng Lập Trình', lastActive: '2 days ago' },
    { id: 5, icon: '👅', name: 'Cộng Đồng Hiếu Lưỡi', lastActive: 'Active now' },
    // Thêm các group khác nếu muốn danh sách dài hơn để test scroll
    { id: 6, icon: '⚖️', name: 'Luật sư Tư Vấn Pháp luật 247', lastActive: '5 hours ago' },
    { id: 7, icon: '🌳', name: 'Yêu Thích Thiên Nhiên Hoang Dã', lastActive: 'Yesterday' },
    { id: 8, icon: '💻', name: 'Thực tập sinh IT Việt Nam', lastActive: '10 minutes ago' },
    { id: 9, icon: '💼', name: 'IT Jobs - Tuyển Dụng IT - Việc làm...', lastActive: '30 minutes ago' },
    { id: 10, icon: '🎮', name: 'Gaming Community VN', lastActive: '2 hours ago' },
    { id: 11, icon: '🍜', name: 'Hội những người thích ăn Phở', lastActive: '1 day ago' },
    { id: 12, icon: '✈️', name: 'Du lịch bụi Việt Nam', lastActive: 'Active now' },
];

const postsData = [
    {
        id: 1,
        authorAvatar: 'https://i.pravatar.cc/40?u=user1',
        authorName: 'Nguyễn Trưởng',
        groupName: 'Cộng Đồng Hiếu Lưỡi',
        timestamp: '2h',
        content: 'Thảm xám ai dùng ai xài ạ nghe người đi đường nói xe con đi ngược chiều...như mới thì đúng là ko biết luật hay cố tình phạm luật. Mong các cơ quan chức năng vào cuộc để đảm bảo an toàn cho người dân.',
        media: [
            'https://picsum.photos/seed/post1img1/600/400',
            'https://picsum.photos/seed/post1img2/150/100',
            'https://picsum.photos/seed/post1img3/150/100',
            'https://picsum.photos/seed/post1img4/150/100',
        ],
        likes: 209,
        commentsCount: 85,
        sharesCount: 4,
        // THÊM DỮ LIỆU BÌNH LUẬN
        comments: [ // Đây là danh sách tất cả comment của post này
            { id: 'c1-1', parentId: null, likesCount: 5, author: 'Lê Văn Tám', avatar: 'https://i.pravatar.cc/30?u=user3', text: 'Đúng rồi, cần phải xử lý nghiêm!', timestamp: '1h ago' },
            { id: 'c1-2', parentId: null, likesCount: 5, author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Nguy hiểm quá :(', timestamp: '45m ago' },
            { id: 'c1-2-1', parentId: 'c1-2', likesCount: 5, author: 'Nguyễn Trưởng', avatar: 'https://i.pravatar.cc/30?u=user1', text: 'Mình cũng thấy vậy bạn ạ.', timestamp: '30m ago' }, // Reply cho c1-2
            { id: 'c1-2-2', parentId: 'c1-2', likesCount: 5, author: 'Nguyễn Trưởng', avatar: 'https://i.pravatar.cc/30?u=user1', text: 'Mình cũng thấy vậy bạn ạ.', timestamp: '30m ago' }, // Reply cho c1-2
            { id: 'c1-3', parentId: null, author: 'User Ẩn Danh', avatar: 'https://i.pravatar.cc/30?u=user5', text: 'Camera đâu?', timestamp: '10m ago' },
            { id: 'c1-2-1-1', parentId: 'c1-2-1', likesCount: 5, author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Cảm ơn bạn Trưởng đã đồng cảm.', timestamp: '15m ago' } // Reply cho c1-2-1
            , { id: 'c1-2-1-2', parentId: 'c1-2-1', author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Cảm ơn bạn Trưởng đã đồng cảm.', timestamp: '15m ago' } // Reply cho c1-2-1
            , { id: 'c1-2-1-3', parentId: 'c1-2-1-1', author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Cảm ơn bạn Trưởng đã đồng cảm.', timestamp: '15m ago' } // Reply cho c1-2-1
            , {
                id: 'c2-n',
                parentId: 'c1-2',  // Đảm bảo rằng parentId đúng là id của bình luận gốc
                author: 'Nguyễn Thị Lan',
                avatar: 'https://i.pravatar.cc/30?u=user5',
                text: 'Mình cũng đã đến đó, rất tuyệt vời!',
                timestamp: '2h ago'
            }

            // , { id: 'c1-2-2', parentId: 'c1-2', author: 'Nguyễn Trưởng', avatar: 'https://i.pravatar.cc/30?u=user1', text: 'Mình cũng thấy vậy bạn ạ.', timestamp: '30m ago' }, // Reply cho c1-2
            // { id: 'c1-2-2', parentId: 'c1-2', author: 'Nguyễn Trưởng', avatar: 'https://i.pravatar.cc/30?u=user1', text: 'Mình cũng thấy vậy bạn ạ.', timestamp: '30m ago' }, // Reply cho c1-2
            // { id: 'c1-2-1-1', parentId: 'c1-2-1', author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Cảm ơn bạn Trưởng đã đồng cảm.', timestamp: '15m ago' } // Reply cho c1-2-1
            ,
            // { id: 'c1-2-1-1', parentId: 'c1-2-1', author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Cảm ơn bạn Trưởng đã đồng cảm.', timestamp: '15m ago' } // Reply cho c1-2-1
            // , { id: 'c1-2-1-1', parentId: 'c1-2-1', author: 'Trần Thị Bưởi', avatar: 'https://i.pravatar.cc/30?u=user4', text: 'Cảm ơn bạn Trưởng đã đồng cảm.', timestamp: '15m ago' } // Reply cho c1-2-1

        ]
    },
    {
        id: 2,
        authorAvatar: 'https://i.pravatar.cc/40?u=user2',
        authorName: 'Trần Văn An',
        groupName: 'Yêu Thích Thiên Nhiên Hoang Dã',
        timestamp: '5h',
        content: 'Một buổi sáng tuyệt vời ở rừng Cúc Phương! Không khí trong lành và cảnh vật hùng vĩ. #nature #travel',
        media: [
            'https://picsum.photos/seed/post2img1/600/300',
        ],
        likes: 150,
        commentsCount: 32,
        sharesCount: 7,
        comments: [
            { id: 'c2-1', parentId: null, author: 'Phạm Thị Duyên', avatar: 'https://i.pravatar.cc/30?u=user6', text: 'Đẹp quá anh ơi!', timestamp: '4h ago' },
            { id: 'c2-2', parentId: null, author: 'Hoàng Văn Hùng', avatar: 'https://i.pravatar.cc/30?u=user7', text: 'Muốn đi quá!', timestamp: '3h ago' },
        ]
    },
];

// START: REACTION_DATA_DEFINITION
const REACTIONS = [
    { name: 'Like', icon: '👍', color: '#2078F4' }, // Màu xanh dương cho Like
    { name: 'Love', icon: '❤️', color: '#F33E58' }, // Màu đỏ cho Love
    { name: 'Haha', icon: '😂', color: '#F7B125' }, // Màu vàng cho Haha
    { name: 'Wow', icon: '😮', color: '#F7B125' },  // Màu vàng cho Wow
    { name: 'Sad', icon: '😢', color: '#F7B125' },   // Màu vàng cho Sad
    { name: 'Angry', icon: '😠', color: '#E9710F' }  // Màu cam cho Angry
];
// END: REACTION_DATA_DEFINITION
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---


// --- BẮT ĐẦU COMPONENT CommentItem (QUAY LẠI "MỖI ITEM TỰ VẼ CHỮ L") ---
// --- BẮT ĐẦU COMPONENT CommentItem (CẬP NHẬT ĐỂ ẨN/HIỆN REPLIES) ---
const CommentItem = ({
    comment, level = 0, styles, iconStyle, secondaryTextColor,
    baseTextColor, commentBubbleBg, borderColor,
    expandedReplies, onToggleSubReplies,
    commentReactions, onCommentReactionSelect, onCommentMainReactionClick,
    onCommentReactionButtonMouseEnter, onCommentReactionButtonMouseLeave,
    getReactionByNameFn,
    // BƯỚC 2.3: NHẬN PROPS MỚI CHO TÍNH NĂNG REPLY
    postId, // ID của post chứa comment này
    replyingToCommentId,
    currentReplyContent,
    onReplyContentChange,
    onToggleReplyForm,
    onPostReply,
    replyInputRef,
    replyPlaceholder,
}) => {
    console.log("==========repl: ", replyPlaceholder)
    const hasReplies = comment.replies && comment.replies.length > 0;
    // ... (areSubRepliesExpanded, actualMarginTopBetweenItems, indentStyle giữ nguyên) ...
    const areSubRepliesExpanded = !!(expandedReplies && expandedReplies[comment.id]);
    const actualMarginTopBetweenItems = parseInt((styles.commentItem && styles.commentItem.marginTop) || '10px', 10);
    const indentStyle = { marginLeft: `${level * 20}px`, position: 'relative', marginTop: `${actualMarginTopBetweenItems}px` };


    // Lấy reaction hiện tại cho comment này
    const currentCommentReactionName = commentReactions && commentReactions[comment.id];
    const currentCommentReactionObject = currentCommentReactionName && getReactionByNameFn ? getReactionByNameFn(currentCommentReactionName) : null;
    // Giả sử comment có trường `likesCount` hoặc bạn sẽ quản lý nó riêng
    const initialLikesCount = comment.likesCount || 0; // Lấy từ data, hoặc mặc định là 0
    const isCurrentlyReplyingThis = replyingToCommentId === comment.id;
    return (
        <div style={indentStyle}>
            {/* --- BỎ HOÀN TOÀN PHẦN VẼ ĐƯỜNG NỐI --- */}
            {/* {isReply && ( ... )} */}

            {/* Phần nội dung comment */}
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <img src={comment.avatar} alt={comment.author} style={styles.commentAuthorAvatar} />
                <div style={styles.commentContent}>
                    <div style={{ ...styles.commentBubble, backgroundColor: commentBubbleBg || '#3A3B3C' }}>
                        <strong style={{ ...styles.commentAuthorName, color: baseTextColor }}>{comment.author}</strong>
                        <p style={{ ...styles.commentText, color: baseTextColor }}>{comment.text}</p>
                    </div>
                    {/* BƯỚC 3.3: CẬP NHẬT COMMENT ACTIONS */}
                    <div style={{ ...styles.commentActions, color: secondaryTextColor || (styles.colors && styles.colors.secondaryTextColor) }}>
                        <span
                            style={{
                                ...styles.commentActionLink,
                                color: currentCommentReactionObject ? currentCommentReactionObject.color : (secondaryTextColor || (styles.colors && styles.colors.secondaryTextColor)),
                                fontWeight: currentCommentReactionObject ? 'bold' : '500',
                                display: 'inline-flex', // Để icon và text canh giữa
                                alignItems: 'center',
                            }}
                            onClick={() => onCommentMainReactionClick && onCommentMainReactionClick(comment.id)}
                            onMouseEnter={(e) => onCommentReactionButtonMouseEnter && onCommentReactionButtonMouseEnter(comment.id, e)}
                            onMouseLeave={() => onCommentReactionButtonMouseLeave && onCommentReactionButtonMouseLeave()}
                        >
                            {currentCommentReactionObject ? (
                                <>
                                    <span style={{ ...iconStyle, marginRight: '4px', fontSize: '14px' }}>{currentCommentReactionObject.icon}</span>
                                    {currentCommentReactionObject.name}
                                </>
                            ) : (
                                <><LikeIcon style={{ ...iconStyle, fontSize: '14px', marginRight: '4px' }} /> Like</> // Icon nhỏ hơn cho comment
                            )}
                        </span>
                        {/* ... (Hiển thị số lượt thích) ... */}
                        {initialLikesCount > 0 && !currentCommentReactionObject && (
                            <span style={styles.commentLikesCount}> {initialLikesCount}</span>
                        )}
                        {currentCommentReactionObject && (
                            <span style={styles.commentLikesCount}> {initialLikesCount + 1}</span>
                        )}
                        <span style={styles.dotSeparator}>·</span>
                        <span
                            style={styles.commentActionLink}
                            onClick={() => onToggleReplyForm && onToggleReplyForm(comment.id, comment.author)} // TRUYỀN THÊM comment.author
                        >
                            Reply
                        </span>
                        <span style={styles.dotSeparator}>·</span>
                        <span style={styles.commentTimestamp}>{comment.timestamp}</span>
                    </div>

                    {/* BƯỚC 3.2: HIỂN THỊ NÚT TOGGLE REPLIES NẾU CÓ REPLIES */}
                    {hasReplies && (
                        <div
                            style={styles.toggleRepliesButton} // Thêm style cho nút này
                            onClick={() => onToggleSubReplies(comment.id)} // Gọi handler khi click
                        >
                            {areSubRepliesExpanded ? 'Hide replies' : `${comment.replies.length} ${comment.replies.length > 1 ? 'replies' : 'reply'}`}
                            {/* Biểu tượng mũi tên có thể thêm ở đây */}
                            <span style={{ marginLeft: '5px', display: 'inline-block', transform: areSubRepliesExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                        </div>
                    )}
                </div>
            </div>

            {/* BƯỚC 2.5: HIỂN THỊ Ô NHẬP LIỆU REPLY NẾU ĐANG REPLY COMMENT NÀY */}
            {isCurrentlyReplyingThis && (
                <div style={styles.replyInputSection}>
                    <img src="https://i.pravatar.cc/30?u=currentUserReplyForm" alt="You" style={{ ...styles.commentAuthorAvatar, marginRight: '8px' }} />
                    <input
                        ref={replyInputRef}
                        type="text"
                        // SỬ DỤNG replyPlaceholder LÀM PLACEHOLDER
                        placeholder={replyPlaceholder || "Write a reply..."}
                        value={currentReplyContent}
                        onChange={(e) => onReplyContentChange && onReplyContentChange(e.target.value)}
                        style={styles.commentInputField}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onPostReply && onPostReply(postId, comment.id);
                            }
                        }}
                    />
                    <button
                        onClick={() => onPostReply && onPostReply(postId, comment.id)}
                        style={styles.replyPostButton}
                        disabled={!currentReplyContent.trim()}
                    >
                        Post
                    </button>
                </div>
            )}

            {/* BƯỚC 3.3: RENDER REPLIES ĐỆ QUY NẾU ĐANG MỞ RỘNG */}
            {hasReplies && areSubRepliesExpanded && (
                <div style={{ marginTop: '0px' }}> {/* Replies được render ngay dưới */}
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            level={level + 1}
                            styles={styles}
                            expandedReplies={expandedReplies}
                            onToggleSubReplies={onToggleSubReplies}
                            commentReactions={commentReactions}
                            // Truyền các handler tooltip xuống
                            onCommentReactionSelect={onCommentReactionSelect}
                            onCommentMainReactionClick={onCommentMainReactionClick}
                            onCommentReactionButtonMouseEnter={onCommentReactionButtonMouseEnter}
                            onCommentReactionButtonMouseLeave={onCommentReactionButtonMouseLeave}
                            getReactionByNameFn={getReactionByNameFn}

                            postId={postId} // Quan trọng: truyền postId xuống
                            replyingToCommentId={replyingToCommentId}
                            currentReplyContent={currentReplyContent}
                            onReplyContentChange={onReplyContentChange}
                            onToggleReplyForm={onToggleReplyForm}
                            onPostReply={onPostReply}
                            replyInputRef={replyInputRef}
                            replyPlaceholder={replyPlaceholder} // Placeholder là chung
                            // ... các props màu và style khác ...
                            borderColor={borderColor}
                            baseTextColor={baseTextColor}
                            secondaryTextColor={secondaryTextColor}
                            commentBubbleBg={commentBubbleBg}
                            iconStyle={iconStyle}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
// --- KẾT THÚC COMPONENT CommentItem ---
// --- KẾT THÚC COMPONENT CommentItem ---



// --- BẮT ĐẦU COMPONENT CHÍNH: CommunityPage ---
const CommunityPage = () => {
    const [replyPlaceholder, setReplyPlaceholder] = useState('');
    const [activeFeed, setActiveFeed] = useState('Your Feed');
    const [sidebarWidth, setSidebarWidth] = useState(320); // Chiều rộng ban đầu của sidebar
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef(null); // Ref cho sidebar để lấy vị trí ban đầu

    const TOOLTIP_HIDE_DELAY_FROM_BUTTON = 300; // Thời gian delay ẩn tooltip khi rời nút (cho phép vào tooltip)
    const TOOLTIP_HIDE_DELAY_FROM_TOOLTIP = 200; // Thời gian delay ẩn tooltip khi rời tooltip
    const MIN_SIDEBAR_WIDTH = 280; // Chiều rộng tối thiểu
    const MAX_SIDEBAR_WIDTH = 500; // Chiều rộng tối đa

    const [postReactions, setPostReactions] = useState({});
    const [commentReactions, setCommentReactions] = useState({});


    // State cho tooltip của POST
    const [activeTooltip, setActiveTooltip] = useState({
        postId: null,
        visible: false,
        position: null,
    });
    const postTooltipTimeoutRef = useRef(null); // Ref cho timeout của post tooltip

    // State cho tooltip của COMMENT
    const [activeCommentTooltip, setActiveCommentTooltip] = useState({
        commentId: null,
        visible: false,
        position: null,
    });
    const commentTooltipTimeoutRef = useRef(null); // Ref cho timeout của comment tooltip

    const TOOLTIP_SHOW_DELAY = 300; // Thời gian chờ để hiện tooltip
    const TOOLTIP_HIDE_DELAY = 400; // Thời gian chờ để ẩn tooltip (cho phép di chuột vào)

    // BƯỚC 1: STATE CHO TÍNH NĂNG REPLY
    const [replyingToCommentId, setReplyingToCommentId] = useState(null); // ID của comment đang được reply
    const [currentReplyContent, setCurrentReplyContent] = useState('');   // Nội dung của ô reply
    const replyInputRef = useRef(null); // Ref để focus vào ô input reply

    // BƯỚC 2.1 (Trong CommentItem) & BƯỚC 3: HÀM XỬ LÝ KHI CLICK NÚT "REPLY" VÀ GỬI REPLY
    // CẬP NHẬT HÀM NÀY
    const handleToggleReplyForm = (commentId, commentAuthor) => { // Nhận thêm commentAuthor
        if (replyingToCommentId === commentId) {
            setReplyingToCommentId(null);
            setCurrentReplyContent('');
            setReplyPlaceholder(''); // Reset placeholder
        } else {
            setReplyingToCommentId(commentId);
            setCurrentReplyContent(''); // Reset nội dung khi mở form mới
            if (commentAuthor) {
                setReplyPlaceholder(`Trả lời ${commentAuthor}...`); // Set placeholder
            } else {
                setReplyPlaceholder('Viết trả lời...');
            }
            setTimeout(() => {
                if (replyInputRef.current) {
                    replyInputRef.current.focus();
                }
            }, 50); // Tăng nhẹ delay để đảm bảo DOM cập nhật placeholder
        }
    };
    const handlePostReply = (postId, parentCommentId) => {
        if (!currentReplyContent.trim()) return; // Không gửi reply rỗng

        const newReply = {
            id: `reply-${Date.now()}-${Math.random()}`, // ID tạm thời, duy nhất
            parentId: parentCommentId,
            author: "Current User", // Lấy thông tin user hiện tại
            avatar: 'https://i.pravatar.cc/30?u=currentUserReply', // Avatar user hiện tại
            text: currentReplyContent.trim(),
            timestamp: 'Just now',
            // replies: [] // Reply mới chưa có replies
        };

        // Cập nhật state `posts`
        setPosts(prevPosts => {
            return prevPosts.map(post => {
                if (post.id === postId) {
                    // Thêm reply mới vào danh sách comments của post này
                    // Vì comments là danh sách phẳng, chỉ cần thêm vào cuối
                    const updatedComments = [...(post.comments || []), newReply];
                    return { ...post, comments: updatedComments, commentsCount: (post.commentsCount || 0) + 1 };
                }
                return post;
            });
        });

        // Reset form reply
        setReplyingToCommentId(null);
        setCurrentReplyContent('');
        // TODO: Gọi API để lưu reply này ở backend
        console.log(`Replying to post ${postId}, parent comment ${parentCommentId}:`, newReply);
    };

    // Hàm hủy timeout an toàn
    const clearTimeoutSafe = (timeoutRef) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };
    // --- REACTION HANDLERS CHO POST ---
    const handleReactionSelect = (postId, reactionName) => {
        setPostReactions(prev => ({ ...prev, [postId]: reactionName }));
        clearTimeoutSafe(postTooltipTimeoutRef); // Hủy mọi timeout đang chờ
        setActiveTooltip({ postId: null, visible: false, position: null }); // Ẩn ngay
    };

    const handleLikeButtonMouseEnter = (postId, event) => {
        clearTimeoutSafe(postTooltipTimeoutRef); // Hủy timeout cũ (nếu có)
        clearTimeoutSafe(commentTooltipTimeoutRef); // Đảm bảo tooltip comment tắt
        setActiveCommentTooltip({ commentId: null, visible: false, position: null });


        const buttonRect = event.currentTarget.getBoundingClientRect();
        postTooltipTimeoutRef.current = setTimeout(() => {
            setActiveTooltip({
                postId: postId,
                visible: true,
                position: { top: buttonRect.top - 50, left: buttonRect.left },
            });
            postTooltipTimeoutRef.current = null; // Đã chạy, reset ref
        }, TOOLTIP_SHOW_DELAY);
    };

    const handleLikeButtonMouseLeave = () => {
        clearTimeoutSafe(postTooltipTimeoutRef); // Hủy timeout hiện (nếu đang chờ hiện)
        postTooltipTimeoutRef.current = setTimeout(() => {
            setActiveTooltip(prev => ({ ...prev, visible: false })); // Chỉ ẩn nếu không có timeout nào khác (ví dụ từ tooltip enter)
            // Thực ra, nếu chuột đã vào tooltip, timeout này đã bị hủy
            postTooltipTimeoutRef.current = null;
        }, TOOLTIP_HIDE_DELAY);
    };

    const handleTooltipMouseEnter = () => {
        clearTimeoutSafe(postTooltipTimeoutRef); // Hủy timeout đang chờ ẩn (từ button leave)
    };

    const handleTooltipMouseLeave = () => {
        clearTimeoutSafe(postTooltipTimeoutRef); // Hủy timeout cũ
        postTooltipTimeoutRef.current = setTimeout(() => {
            setActiveTooltip({ postId: null, visible: false, position: null });
            postTooltipTimeoutRef.current = null;
        }, TOOLTIP_HIDE_DELAY);
    };

    const handleMainReactionClick = (postId) => {
        const currentReaction = postReactions[postId];
        clearTimeoutSafe(postTooltipTimeoutRef);
        setActiveTooltip({ postId: null, visible: false, position: null });

        if (currentReaction) {
            setPostReactions(prev => { const newState = { ...prev }; delete newState[postId]; return newState; });
        } else {
            handleReactionSelect(postId, 'Like'); // Sẽ ẩn tooltip
        }
    };


    // --- REACTION HANDLERS CHO COMMENT ---
    const handleCommentReactionSelect = (commentId, reactionName) => {
        setCommentReactions(prev => ({ ...prev, [commentId]: reactionName }));
        clearTimeoutSafe(commentTooltipTimeoutRef);
        setActiveCommentTooltip({ commentId: null, visible: false, position: null });
    };

    const handleCommentReactionButtonMouseEnter = (commentId, event) => {
        clearTimeoutSafe(commentTooltipTimeoutRef);
        clearTimeoutSafe(postTooltipTimeoutRef); // Đảm bảo tooltip post tắt
        setActiveTooltip({ postId: null, visible: false, position: null });


        const buttonRect = event.currentTarget.getBoundingClientRect();
        commentTooltipTimeoutRef.current = setTimeout(() => {
            setActiveCommentTooltip({
                commentId: commentId,
                visible: true,
                position: { top: buttonRect.top - 50, left: buttonRect.left },
            });
            commentTooltipTimeoutRef.current = null;
        }, TOOLTIP_SHOW_DELAY);
    };

    const handleCommentReactionButtonMouseLeave = () => {
        clearTimeoutSafe(commentTooltipTimeoutRef);
        commentTooltipTimeoutRef.current = setTimeout(() => {
            setActiveCommentTooltip(prev => ({ ...prev, visible: false }));
            commentTooltipTimeoutRef.current = null;
        }, TOOLTIP_HIDE_DELAY);
    };

    const handleCommentTooltipMouseEnter = () => {
        clearTimeoutSafe(commentTooltipTimeoutRef);
    };

    const handleCommentTooltipMouseLeave = () => {
        clearTimeoutSafe(commentTooltipTimeoutRef);
        commentTooltipTimeoutRef.current = setTimeout(() => {
            setActiveCommentTooltip({ commentId: null, visible: false, position: null });
            commentTooltipTimeoutRef.current = null;
        }, TOOLTIP_HIDE_DELAY);
    };

    const handleCommentMainReactionClick = (commentId) => {
        const currentReaction = commentReactions[commentId];
        clearTimeoutSafe(commentTooltipTimeoutRef);
        setActiveCommentTooltip({ commentId: null, visible: false, position: null });

        if (currentReaction) {
            setCommentReactions(prev => { const newState = { ...prev }; delete newState[commentId]; return newState; });
        } else {
            handleCommentReactionSelect(commentId, 'Like');
        }
    };
    ///////////////////////////////////////////////////
    const hidePostTooltip = (immediate = false) => {
        if (activeTooltip.timeoutId) clearTimeout(activeTooltip.timeoutId);
        if (immediate) {
            setActiveTooltip({ postId: null, visible: false, position: null, timeoutId: null });
        } else {
            const newTimeoutId = setTimeout(() => {
                setActiveTooltip({ postId: null, visible: false, position: null, timeoutId: null });
            }, TOOLTIP_HIDE_DELAY);
            setActiveTooltip(prev => ({ ...prev, timeoutId: newTimeoutId }));
        }
    };

    const hideCommentTooltip = (immediate = false) => {
        if (activeCommentTooltip.timeoutId) clearTimeout(activeCommentTooltip.timeoutId);
        if (immediate) {
            setActiveCommentTooltip({ commentId: null, visible: false, position: null, timeoutId: null });
        } else {
            const newTimeoutId = setTimeout(() => {
                setActiveCommentTooltip({ commentId: null, visible: false, position: null, timeoutId: null });
            }, TOOLTIP_HIDE_DELAY);
            setActiveCommentTooltip(prev => ({ ...prev, timeoutId: newTimeoutId }));
        }
    };


    // --- REACTION HANDLERS CHO POST ---









    // Hàm helper để hủy timeout và reset tooltip state
    const resetPostTooltip = () => {
        if (activeTooltip.timeoutId) clearTimeout(activeTooltip.timeoutId);
        setActiveTooltip({ postId: null, visible: false, position: null, timeoutId: null });
    };

    const resetCommentTooltip = () => {
        if (activeCommentTooltip.timeoutId) clearTimeout(activeCommentTooltip.timeoutId);
        setActiveCommentTooltip({ commentId: null, visible: false, position: null, timeoutId: null });
    };


    // State mới để quản lý việc hiển thị bình luận
    const [expandedComments, setExpandedComments] = useState({}); // { postId: true } nếu bình luận của post đó đang mở
    // BƯỚC 1: THÊM STATE MỚI CHO COMMENT REACTIONS
    // BƯỚC 2: HÀM XỬ LÝ REACTION CHO COMMENT

    // BƯỚC 2.2: HÀM XỬ LÝ TOOLTIP REACTION CHO COMMENT


    // BƯỚC 1: THÊM STATE MỚI ĐỂ QUẢN LÝ REPLIES CỦA TỪNG COMMENT CHA
    const [expandedReplies, setExpandedReplies] = useState({}); // Ví dụ: { 'c1-2': true, 'c1-2-1': false }

    // BƯỚC 2: HÀM ĐỂ TOGGLE VIỆC HIỂN THỊ REPLIES CHO MỘT COMMENT CHA
    const toggleSubRepliesVisibility = (parentCommentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [parentCommentId]: !prev[parentCommentId] // Đảo ngược trạng thái của parentCommentId
        }));
    };

    // ... (phần logic kéo thả sidebar, reaction handlers giữ nguyên) ...
    // END: COMMUNITY_PAGE_STATE_FOR_COMMENTS

    // START: TOGGLE_COMMENTS_HANDLER_FUNCTION
    const toggleCommentsVisibility = (postId) => {
        setExpandedComments(prev => ({
            ...prev,
            [postId]: !prev[postId] // Đảo ngược trạng thái hiển thị của postId
        }));
    };
    // END: TOGGLE_COMMENTS_HANDLER_FUNCTION

    // State mới cho reactions và tooltip

    // Kết thúc state mới

    // --- LOGIC KÉO THẢ SIDEBAR ---
    const startResizing = useCallback((mouseDownEvent) => {
        // Ngăn chặn chọn text khi kéo
        mouseDownEvent.preventDefault();
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);


    const resize = useCallback((mouseMoveEvent) => {
        if (isResizing && sidebarRef.current) {
            // Vị trí x của chuột so với cạnh trái của viewport
            const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;

            if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
                setSidebarWidth(newWidth);
            } else if (newWidth < MIN_SIDEBAR_WIDTH) {
                setSidebarWidth(MIN_SIDEBAR_WIDTH);
            } else if (newWidth > MAX_SIDEBAR_WIDTH) {
                setSidebarWidth(MAX_SIDEBAR_WIDTH);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);
    // --- KẾT THÚC LOGIC KÉO THẢ SIDEBAR ---


    // START: REACTION_HANDLER_FUNCTIONS


    const getReactionByName = (reactionName) => {
        return REACTIONS.find(r => r.name === reactionName) || REACTIONS[0]; // Mặc định là Like
    };



    // END: REACTION_HANDLER_FUNCTIONS

    // --- PHẦN: LEFT SIDEBAR ---
    const renderLeftSidebar = () => (
        <div
            ref={sidebarRef}
            style={{ ...styles.leftSidebar, width: `${sidebarWidth}px` }} // Áp dụng chiều rộng động
        >
            <div style={styles.sidebarContent}> {/* Container cho nội dung, để handle không bị scroll */}
                {/* --- SUB-COMPONENT: SidebarHeader (Search & Settings) --- */}
                <div style={styles.sidebarHeader}>
                    <div style={styles.searchBarContainer}>
                        <SearchIcon />
                        <input type="text" placeholder="Search Groups" style={styles.searchInput} />
                    </div>
                    <button style={styles.settingsButton} title="Settings">
                        <SettingsIcon />
                    </button>
                </div>
                {/* --- KẾT THÚC SUB-COMPONENT: SidebarHeader --- */}

                {/* --- SUB-COMPONENT: SidebarMenu --- */}
                <div style={styles.sidebarMenu}>
                    {['Your Feed', 'Discover', 'Your Groups'].map(item => (
                        <div
                            key={item}
                            style={item === activeFeed ? { ...styles.menuItem, ...styles.menuItemActive } : styles.menuItem}
                            onClick={() => setActiveFeed(item)}
                            role="button"
                            tabIndex={0}
                        >
                            {item}
                            {item === 'Your Groups' && <ArrowDownIcon />}
                        </div>
                    ))}
                    <button style={styles.createGroupButton}>
                        <a href="/community/create" style={{ color: 'white' }}  >
                            + Create new group
                        </a>
                    </button>
                </div>
                {/* --- KẾT THÚC SUB-COMPONENT: SidebarMenu --- */}

                {/* --- SUB-COMPONENT: JoinedGroupsSection --- */}
                <div style={styles.joinedGroupsSection}>
                    <div style={styles.joinedGroupsHeader}>
                        <h3 style={styles.sectionTitle}>Groups you've joined</h3>
                        <a href="#see-all-groups" style={styles.seeAllLink}>See all</a>
                    </div>
                    <div style={styles.joinedGroupsList}>
                        {joinedGroupsData.map(group => (
                            <div key={group.id} style={styles.groupListItem}>
                                <div style={styles.groupIconPlaceholder}>{group.icon || 'G'}</div>
                                <div style={styles.groupInfo}>
                                    <span style={styles.groupName}>{group.name}</span>
                                    <span style={styles.groupLastActive}>Last active {group.lastActive}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* --- KẾT THÚC SUB-COMPONENT: JoinedGroupsSection --- */}
            </div>
            {/* --- RESIZE HANDLE --- */}
            <div
                style={styles.resizeHandle}
                onMouseDown={startResizing}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize sidebar"
            />
        </div >
    );
    // --- KẾT THÚC PHẦN: LEFT SIDEBAR ---


    // --- PHẦN: RIGHT CONTENT AREA ---
    const renderRightContent = () => (
        <div style={styles.rightContent}>
            <h2 style={styles.contentTitle}>Recent Activity</h2>
            <div style={styles.postList}>

                {postsData.map(post => {

                    // Lấy reaction hiện tại của post từ state `postReactions`
                    const currentSelectedReactionName = postReactions[post.id];
                    // Dùng hàm getReactionByName (đã tạo ở bước 3) để lấy đối tượng reaction đầy đủ (icon, color)
                    const currentReactionObject = currentSelectedReactionName ? getReactionByName(currentSelectedReactionName) : null;
                    // ... (code lấy currentSelectedReactionName, currentReactionObject giữ nguyên) ...
                    const areCommentsExpanded = !!expandedComments[post.id]; // Kiểm tra xem bình luận có đang mở không

                    return <div key={post.id} style={styles.postCard}>
                        <div style={styles.postHeader}>
                            <div style={styles.postAuthorInfo}>
                                <img src={post.authorAvatar} alt={post.authorName} style={styles.postAuthorAvatar} />
                                <div>
                                    <div>
                                        <strong style={styles.postAuthorName}>{post.authorName}</strong>
                                        <span style={styles.postInGroup}> posted in </span>
                                        <strong style={styles.postGroupName}>{post.groupName}</strong>
                                    </div>
                                    <div style={styles.postMeta}>
                                        <GlobeIcon />
                                        <span style={styles.postVisibility}>Public</span>
                                        <span style={styles.dotSeparator}>·</span>
                                        <span style={styles.postTimestamp}>{post.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                            <button style={styles.moreButton} title="More options"><MoreHorizIcon /></button>
                        </div>
                        <div style={styles.postBody}>
                            <p>{post.content}</p>
                        </div>
                        {post.media && post.media.length > 0 && (
                            <div style={styles.postMediaContainer}>
                                {post.media.length === 1 && (
                                    <img src={post.media[0]} alt="Post media" style={styles.singleMediaImage} />
                                )}
                                {post.media.length > 1 && (
                                    <div style={styles.multipleMediaLayout}>
                                        <div style={{ flex: post.media.length > 2 ? 2 : 1, maxHeight: '400px' }}>
                                            <img src={post.media[0]} alt="Post media 1" style={styles.mainMediaImage} />
                                        </div>
                                        {post.media.length > 1 && (
                                            <div style={styles.thumbnailMediaContainer}>
                                                {post.media.slice(1, 4).map((imgUrl, index) => (
                                                    <div key={index} style={{ flex: 1, maxHeight: `${400 / Math.min(3, post.media.length - 1)}px` }}>
                                                        <img src={imgUrl} alt={`Post media ${index + 2}`} style={styles.thumbnailMediaImage} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div style={styles.postActions}>
                            <div style={styles.actionButtons}>
                                <button
                                    style={{
                                        ...styles.actionButton,
                                        color: currentReactionObject ? currentReactionObject.color : (styles.colors ? styles.colors.secondaryTextColor : secondaryTextColor),
                                        fontWeight: currentReactionObject ? 'bold' : '600',
                                    }}
                                    onMouseEnter={(e) => handleLikeButtonMouseEnter(post.id, e)}
                                    onMouseLeave={handleLikeButtonMouseLeave} // Sử dụng handler đã cập nhật
                                    onClick={() => handleMainReactionClick(post.id)}
                                >
                                    {/* 3. NỘI DUNG ĐỘNG CỦA NÚT: */}
                                    {currentReactionObject ? (
                                        <>
                                            <span style={{ ...iconStyle, marginRight: '5px', fontSize: '18px' }}>{currentReactionObject.icon}</span>
                                            {currentReactionObject.name}
                                        </>
                                    ) : ( // Nếu chưa có reaction nào được chọn
                                        <><LikeIcon /> Like</> // Hiển thị "Like" mặc định
                                    )}
                                    {' '}({post.likes}) {/* Giữ nguyên số lượng like ban đầu */}
                                </button>
                                {/* SỬA NÚT COMMENT */}
                                <button
                                    style={styles.actionButton}
                                    onClick={() => toggleCommentsVisibility(post.id)} // Click để mở/đóng comment
                                >
                                    <CommentIcon /> Comment  {/* Hiển thị số lượng Comment nếu có */}
                                    {post.commentsCount > 0 && <span style={styles.actionCount}> ({post.commentsCount})</span>}
                                </button>
                                <button style={styles.actionButton}><ShareIcon /> Share
                                    {/* Hiển thị số lượng Share nếu có */}
                                    {post.sharesCount > 0 && <span style={styles.actionCount}> ({post.sharesCount})</span>}
                                </button>
                            </div>


                            {areCommentsExpanded && (
                                <div style={styles.commentsSection}>
                                    {/* Ô NHẬP BÌNH LUẬN MỚI (ĐƠN GIẢN) */}
                                    <div style={styles.commentInputContainer}>
                                        <img src="https://i.pravatar.cc/30?u=currentUser" alt="You" style={styles.commentAuthorAvatar} />
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            style={styles.commentInputField}
                                        // TODO: Thêm state và handler để quản lý việc nhập và gửi bình luận
                                        />
                                        {/* <button>Post</button> // Nút post có thể thêm sau */}
                                    </div>

                                    {/* DANH SÁCH CÁC BÌNH LUẬN */}
                                    {/* THAY ĐỔI LOGIC Ở ĐÂY */}
                                    {(() => { // Sử dụng IIFE để chứa logic
                                        if (post.comments && post.comments.length > 0) {
                                            // BƯỚC 3.1: XÂY DỰNG CÂY COMMENT
                                            const commentTree = buildCommentTree(post.comments, null);

                                            if (commentTree.length > 0) {
                                                return commentTree.map(comment => (
                                                    <CommentItem
                                                        key={comment.id}
                                                        comment={comment}
                                                        level={0}
                                                        styles={styles}
                                                        expandedReplies={expandedReplies}
                                                        onToggleSubReplies={toggleSubRepliesVisibility}
                                                        commentReactions={commentReactions}
                                                        // BƯỚC 3.1: TRUYỀN CÁC HANDLER TOOLTIP XUỐNG
                                                        onCommentReactionSelect={handleCommentReactionSelect}
                                                        onCommentMainReactionClick={handleCommentMainReactionClick}
                                                        onCommentReactionButtonMouseEnter={handleCommentReactionButtonMouseEnter}
                                                        onCommentReactionButtonMouseLeave={handleCommentReactionButtonMouseLeave}
                                                        getReactionByNameFn={getReactionByName}

                                                        // BƯỚC 2.2: TRUYỀN PROPS CHO TÍNH NĂNG REPLY XUỐNG CommentItem
                                                        postId={post.id} // Cần postId để biết reply này thuộc post nào
                                                        replyingToCommentId={replyingToCommentId}
                                                        currentReplyContent={currentReplyContent}
                                                        onReplyContentChange={setCurrentReplyContent}
                                                        onToggleReplyForm={handleToggleReplyForm}
                                                        onPostReply={handlePostReply}
                                                        replyInputRef={replyInputRef} // Truyền ref
                                                        replyPlaceholder={replyPlaceholder} // TRUYỀN PLACEHOLDER MỚI

                                                        iconStyle={iconStyle}
                                                        borderColor={styles.colors.borderColor}
                                                        baseTextColor={styles.colors.baseTextColor}
                                                        secondaryTextColor={styles.colors.secondaryTextColor}
                                                        commentBubbleBg={styles.colors.commentBubbleBg}
                                                    // ... (các props màu và style khác) ...
                                                    />
                                                ));
                                            }
                                        }
                                        return null;
                                    })()}
                                    {/* Nút "View more comments" có thể thêm ở đây nếu danh sách dài */}

                                </div>
                            )}
                        </div>
                    </div>;
                })}
            </div>
        </div>
    );
    // --- KẾT THÚC PHẦN: RIGHT CONTENT AREA ---

    return (
        <div style={styles.pageContainer}>
            {renderLeftSidebar()}
            {renderRightContent()}

            {/* Reaction Tooltip */}
            {activeTooltip.visible && activeTooltip.postId && activeTooltip.position && (
                <div
                    style={{
                        ...styles.reactionTooltip,
                        top: `${activeTooltip.position.top}px`,
                        left: `${activeTooltip.position.left}px`,
                    }}
                    onMouseEnter={handleTooltipMouseEnter} // Handler đã cập nhật
                    onMouseLeave={handleTooltipMouseLeave} // Handler đã cập nhật // Ẩn tooltip khi chuột rời
                >
                    {REACTIONS.map(reaction => (
                        <button
                            key={reaction.name}
                            style={styles.reactionButtonInTooltip}
                            title={reaction.name}
                            onClick={() => handleReactionSelect(activeTooltip.postId, reaction.name)}
                        >
                            <span style={{ ...styles.reactionIconInTooltip, transform: 'scale(1)' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'} // Hiệu ứng phóng to khi hover
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {reaction.icon}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* BƯỚC 4: RENDER TOOLTIP REACTION CHO COMMENT */}
            {activeCommentTooltip.visible && activeCommentTooltip.commentId && activeCommentTooltip.position && (
                <div
                    style={{
                        ...styles.reactionTooltip, // Dùng chung style tooltip
                        top: `${activeCommentTooltip.position.top}px`,
                        left: `${activeCommentTooltip.position.left}px`,
                    }}
                    onMouseEnter={handleCommentTooltipMouseEnter} // Để giữ tooltip mở khi chuột vào
                    onMouseLeave={handleCommentTooltipMouseLeave} // Để ẩn tooltip khi chuột rời
                >
                    {REACTIONS.map(reaction => (
                        <button
                            key={reaction.name}
                            style={styles.reactionButtonInTooltip}
                            title={reaction.name}
                            onClick={() => handleCommentReactionSelect(activeCommentTooltip.commentId, reaction.name)} // Gọi hàm select cho comment
                        >
                            <span style={{ ...styles.reactionIconInTooltip, transform: 'scale(1)' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {reaction.icon}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
// --- KẾT THÚC COMPONENT CHÍNH: CommunityPage ---




export default CommunityPage;