// Test imports từ communitySlice
import React from 'react';

// Test import basic actions
try {
    const { joinCommunity, leaveCommunity, checkMembership } = require('../slices/communitySlice');
    console.log('Basic actions imported successfully');
} catch (error) {
    console.error('Error importing basic actions:', error);
}

// Test import selectors
try {
    const { 
        selectJoinCommunityStatus,
        selectJoinCommunityError,
        selectLeaveCommunityStatus,
        selectLeaveCommunityError,
        selectMembershipCheckStatus,
        selectCurrentCommunityMembership,
        selectIsCurrentUserMemberOfSelectedCommunity,
    } = require('../slices/communitySlice');
    console.log('Selectors imported successfully');
} catch (error) {
    console.error('Error importing selectors:', error);
}

const TestComponent = () => {
    return <div>Test</div>;
};

export default TestComponent;
