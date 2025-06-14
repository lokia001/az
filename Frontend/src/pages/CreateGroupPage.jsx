import React, { useState } from 'react';

// --- ICON PLACEHOLDERS (Thay thế bằng thư viện icon thực tế) ---
const DesktopIcon = () => <span style={iconStyle}>🖥️</span>;
const PhoneIcon = () => <span style={{ ...iconStyle, marginLeft: '8px' }}>📱</span>;
const ArrowDownIcon = () => <span style={{ ...iconStyle, fontSize: '10px', marginLeft: '5px' }}>▼</span>;
const PhotoVideoIcon = () => <span style={{ ...iconStyle, marginRight: '5px' }}>🖼️</span>;
const TagPeopleIcon = () => <span style={{ ...iconStyle, marginRight: '5px' }}>👥</span>;
const FeelingActivityIcon = () => <span style={{ ...iconStyle, marginRight: '5px' }}>😀</span>;
// --- KẾT THÚC ICON PLACEHOLDERS ---

// --- DỮ LIỆU GIẢ LẬP (NẾU CẦN) ---
const currentUser = {
    avatar: 'https://i.pravatar.cc/40?u=hsHuu', // Thay bằng avatar thật
    name: 'Hs Huu',
    role: 'Admin',
};

const suggestedFriends = ['Luong Xuan Truong', 'Phan T. Van Anh', 'Nguyen Cong Phuong', 'Do Duy Manh'];
// --- KẾT THÚC DỮ LIỆU GIẢ LẬP ---


// --- BẮT ĐẦU COMPONENT CHÍNH: CreateGroupPage ---
const CreateGroupPage = () => {
    // State cho các trường input (ví dụ)
    const [groupName, setGroupName] = useState('');
    const [privacy, setPrivacy] = useState('Public'); // Giá trị mặc định cho dropdown
    const [inviteFriends, setInviteFriends] = useState('');

    // --- PHẦN: LEFT SIDEBAR (FORM TẠO NHÓM) ---
    // (Có thể tách thành <CreateGroupFormSidebar />)
    const renderLeftSidebar = () => (
        <div style={styles.leftSidebar}>
            <div style={styles.sidebarHeader}>
                <h2 style={styles.mainTitle}>Groups</h2>
                <h1 style={styles.subTitle}>Create group</h1>
            </div>

            {/* --- Thông tin người tạo --- */}
            <div style={styles.creatorInfo}>
                <img src={currentUser.avatar} alt={currentUser.name} style={styles.creatorAvatar} />
                <div style={styles.creatorDetails}>
                    <span style={styles.creatorName}>{currentUser.name}</span>
                    <span style={styles.creatorRole}>{currentUser.role}</span>
                </div>
            </div>

            {/* --- Form tạo nhóm --- */}
            {/* (Có thể tách thành <GroupCreationForm />) */}
            <form style={styles.groupForm}>
                {/* Group Name */}
                <div style={styles.formField}>
                    {/* <label htmlFor="groupName" style={styles.label}>Group name</label> */}
                    <input
                        type="text"
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Group name"
                        style={styles.inputField}
                    />
                </div>

                {/* Choose Privacy */}
                <div style={styles.formField}>
                    {/* <label htmlFor="privacy" style={styles.label}>Choose privacy</label> */}
                    <div style={styles.selectContainer}>
                        <select
                            id="privacy"
                            value={privacy}
                            onChange={(e) => setPrivacy(e.target.value)}
                            style={styles.selectField}
                        >
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                        </select>
                        <ArrowDownIcon />
                    </div>
                </div>

                {/* Invite Friends */}
                <div style={styles.formField}>
                    {/* <label htmlFor="inviteFriends" style={styles.label}>Invite friends (optional)</label> */}
                    <input
                        type="text"
                        id="inviteFriends"
                        value={inviteFriends}
                        onChange={(e) => setInviteFriends(e.target.value)}
                        placeholder="Invite friends (optional)"
                        style={styles.inputField}
                    />
                    <div style={styles.suggestedFriends}>
                        Suggested: {suggestedFriends.slice(0, 3).join(', ')}{suggestedFriends.length > 3 ? ', ...' : ''}
                    </div>
                </div>

                <button type="button" style={styles.createButton} onClick={() => alert('Create Group Clicked!')}>
                    Create
                </button>
            </form>
        </div>
    );
    // --- KẾT THÚC PHẦN: LEFT SIDEBAR ---


    // --- PHẦN: RIGHT PREVIEW AREA ---
    // (Có thể tách thành <GroupDesktopPreview />)
    const renderRightPreview = () => (
        <div style={styles.rightPreview}>
            <div style={styles.previewHeader}>
                <span style={styles.previewTitle}>Desktop Preview</span>
                <div style={styles.deviceIcons}>
                    <DesktopIcon />
                    <PhoneIcon />
                </div>
            </div>

            <div style={styles.previewContent}>
                {/* --- Ảnh bìa (placeholder) --- */}
                <div style={styles.coverPhotoPlaceholder}>
                    {/* Bạn có thể thêm một <img> với src placeholder ở đây */}
                    <span style={styles.coverPhotoText}>Group Cover Photo Area</span>
                </div>

                {/* --- Thông tin nhóm (placeholder) --- */}
                <div style={styles.groupInfoPreview}>
                    <h2 style={styles.previewGroupName}>{groupName || 'Group name'}</h2>
                    <span style={styles.previewGroupMeta}>{privacy} group</span>
                    <span style={styles.previewGroupMeta}>· 1 member</span>
                </div>

                {/* --- Thanh điều hướng nhóm (placeholder) --- */}
                <div style={styles.groupNavPlaceholder}>
                    {['About', 'Posts', 'Members', 'Events'].map(tab => (
                        <span
                            key={tab}
                            style={tab === 'Posts' ? { ...styles.navTab, ...styles.navTabActive } : styles.navTab}
                        >
                            {tab}
                        </span>
                    ))}
                </div>

                <div style={styles.mainContentAndSidebarPreview}>
                    {/* --- Khu vực nội dung chính của nhóm (tạo bài viết) --- */}
                    <div style={styles.postAreaPreview}>
                        <div style={styles.createPostPlaceholder}>
                            <img src={currentUser.avatar} alt="user" style={styles.createPostAvatar} />
                            <input
                                type="text"
                                placeholder={`What's on your mind, ${currentUser.name.split(' ')[0]}?`}
                                style={styles.createPostInput}
                                readOnly
                            />
                        </div>
                        <div style={styles.createPostOptions}>
                            <div style={styles.optionItem}><PhotoVideoIcon /> Photo/video</div>
                            <div style={styles.optionItem}><TagPeopleIcon /> Tag people</div>
                            <div style={styles.optionItem}><FeelingActivityIcon /> Feeling/activity</div>
                        </div>
                    </div>

                    {/* --- Sidebar "About" của nhóm (placeholder) --- */}
                    <div style={styles.aboutSidebarPlaceholder}>
                        <h3 style={styles.aboutTitlePreview}>About</h3>
                        <div style={styles.aboutContentPlaceholder}>
                            <p>This is where the group description and other information will appear.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    // --- KẾT THÚC PHẦN: RIGHT PREVIEW AREA ---

    return (
        <div style={styles.pageContainer}>
            {renderLeftSidebar()}
            {renderRightPreview()}
        </div>
    );
};
// --- KẾT THÚC COMPONENT CHÍNH: CreateGroupPage ---


// --- PHẦN STYLES ---
const baseTextColor = '#E4E6EB';
const secondaryTextColor = '#B0B3B8';
const darkBg = '#18191A'; // Nền chính của trang
const sidebarBg = '#242526'; // Nền của sidebar trái
const cardBg = '#242526'; // Nền cho các card/vùng preview
const inputBg = '#3A3B3C'; // Nền cho input
const hoverBg = '#3A3B3C';
const primaryBlue = '#2374E1';
const borderColor = '#3E4042';
const disabledButtonBg = '#4E4F50';
const disabledButtonColor = '#A0A3A8';

const iconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: secondaryTextColor,
};

const styles = {
    pageContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: darkBg,
        color: baseTextColor,
        fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
    },
    // --- Left Sidebar Styles ---
    leftSidebar: {
        width: '30%',
        minWidth: '360px', // Giữ cho sidebar không quá hẹp
        maxWidth: '450px',
        backgroundColor: sidebarBg,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
    },
    sidebarHeader: {
        marginBottom: '24px',
    },
    mainTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: baseTextColor,
        margin: '0 0 4px 0',
    },
    subTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: baseTextColor,
        margin: 0,
    },
    creatorInfo: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
    },
    creatorAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '12px',
    },
    creatorDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    creatorName: {
        fontSize: '15px',
        fontWeight: '600',
        color: baseTextColor,
    },
    creatorRole: {
        fontSize: '13px',
        color: secondaryTextColor,
    },
    groupForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px', // Khoảng cách giữa các trường form
    },
    formField: {},
    label: { // Không dùng label riêng trong UI này, placeholder đủ rõ
        // display: 'block',
        // marginBottom: '6px',
        // fontSize: '14px',
        // color: secondaryTextColor,
    },
    inputField: {
        width: '100%',
        padding: '10px 12px',
        backgroundColor: inputBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '6px',
        color: baseTextColor,
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        '::placeholder': {
            color: secondaryTextColor,
        }
    },
    selectContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    selectField: {
        width: '100%',
        padding: '10px 12px',
        backgroundColor: inputBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '6px',
        color: baseTextColor,
        fontSize: '15px',
        outline: 'none',
        appearance: 'none', // Ẩn mũi tên mặc định của select
        cursor: 'pointer',
        paddingRight: '30px', // Để có không gian cho icon mũi tên tùy chỉnh
    },
    // Mũi tên cho select (chồng lên selectField)
    // ArrowDownIcon sẽ được style riêng để nằm trong selectContainer
    // (Trong thực tế, icon mũi tên sẽ nằm trong div này)
    // selectArrow: {
    //     position: 'absolute',
    //     right: '12px',
    //     top: '50%',
    //     transform: 'translateY(-50%)',
    //     pointerEvents: 'none', // Để click xuyên qua icon
    // },
    suggestedFriends: {
        fontSize: '13px',
        color: secondaryTextColor,
        marginTop: '6px',
    },
    createButton: {
        backgroundColor: disabledButtonBg, // Nút "Create" màu xám
        color: disabledButtonColor,
        border: 'none',
        padding: '10px 15px',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer', // Sẽ là 'not-allowed' nếu disabled
        marginTop: 'auto', // Đẩy nút xuống dưới cùng nếu sidebar có khoảng trống
        alignSelf: 'flex-start', // Chỉ chiếm chiều rộng cần thiết
        minWidth: '100px',
        textAlign: 'center',
    },

    // --- Right Preview Area Styles ---
    rightPreview: {
        flexGrow: 1,
        backgroundColor: darkBg, // Nền của phần preview (giống nền trang)
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto', // Cho phép cuộn nếu nội dung preview dài
    },
    previewHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
    },
    previewTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: baseTextColor,
    },
    deviceIcons: {
        display: 'flex',
    },
    previewContent: {
        backgroundColor: cardBg, // Nền của card preview chính
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        padding: '16px', // Padding bên trong card preview
        flexGrow: 1, // Để card này chiếm không gian nếu rightPreview có chiều cao cố định
    },
    coverPhotoPlaceholder: {
        width: '100%',
        height: '200px', // Chiều cao ví dụ cho ảnh bìa
        backgroundColor: '#3A3B3C', // Màu nền xám nhạt cho placeholder
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: secondaryTextColor,
        fontSize: '14px',
        marginBottom: '16px',
        // Thêm hình ảnh minh họa ở đây nếu muốn (ví dụ: background-image)
    },
    coverPhotoText: {},
    groupInfoPreview: {
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${borderColor}`,
    },
    previewGroupName: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: baseTextColor,
        margin: '0 0 4px 0',
    },
    previewGroupMeta: {
        fontSize: '14px',
        color: secondaryTextColor,
        display: 'inline-block', // Để các meta item nằm trên cùng hàng nếu đủ chỗ
        marginRight: '8px',
    },
    groupNavPlaceholder: {
        display: 'flex',
        gap: '16px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${borderColor}`,
        marginBottom: '16px',
    },
    navTab: {
        fontSize: '15px',
        fontWeight: '600',
        color: secondaryTextColor,
        padding: '8px 0', // Padding để tạo vùng click
        cursor: 'pointer',
        position: 'relative', // Để tạo gạch chân active
    },
    navTabActive: {
        color: primaryBlue,
        // Tạo gạch chân active
        '::after': { // Khó làm với inline style, cần CSS thực sự hoặc JS
            // content: '""',
            // position: 'absolute',
            // bottom: '-1px', // Nằm ngay trên borderBottom của groupNavPlaceholder
            // left: 0,
            // width: '100%',
            // height: '3px',
            // backgroundColor: primaryBlue,
        },
        borderBottom: `3px solid ${primaryBlue}`, // Cách đơn giản hơn với inline style
        paddingBottom: '9px', // (12px padding - 3px border)
    },
    mainContentAndSidebarPreview: {
        display: 'flex',
        gap: '16px',
    },
    postAreaPreview: {
        flexGrow: 1, // Chiếm phần lớn không gian
        // backgroundColor: '#1C1E21', // Nền khác biệt một chút nếu muốn
        // padding: '12px',
        // borderRadius: '6px',
    },
    createPostPlaceholder: {
        backgroundColor: inputBg, // Nền giống input
        padding: '12px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        border: `1px solid ${borderColor}`,
    },
    createPostAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        marginRight: '10px',
    },
    createPostInput: {
        flexGrow: 1,
        border: 'none',
        backgroundColor: 'transparent',
        color: secondaryTextColor, // Màu placeholder
        fontSize: '15px',
        outline: 'none',
    },
    createPostOptions: {
        display: 'flex',
        justifyContent: 'space-around', // Hoặc space-between
        padding: '8px 0',
        borderTop: `1px solid ${borderColor}`,
    },
    optionItem: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500',
        color: secondaryTextColor,
        cursor: 'pointer',
        padding: '8px 10px',
        borderRadius: '4px',
        // ':hover': { backgroundColor: hoverBg }
    },
    aboutSidebarPlaceholder: {
        width: '280px', // Chiều rộng cố định cho sidebar "About"
        flexShrink: 0,
        // backgroundColor: '#1C1E21',
        // padding: '12px',
        // borderRadius: '6px',
    },
    aboutTitlePreview: {
        fontSize: '17px',
        fontWeight: 'bold',
        color: baseTextColor,
        marginBottom: '10px',
    },
    aboutContentPlaceholder: {
        backgroundColor: inputBg, // Màu nền placeholder
        height: '150px', // Chiều cao ví dụ
        borderRadius: '6px',
        padding: '10px',
        fontSize: '14px',
        color: secondaryTextColor,
        border: `1px solid ${borderColor}`,
    },
};

export default CreateGroupPage;