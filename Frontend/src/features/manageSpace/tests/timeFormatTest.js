// Time Format Test for SpaceForm
// Tests the time handling between frontend HTML time input and backend TimeSpan

// Test data that might come from backend (TimeSpan format: HH:MM:SS)
const backendTimeData = {
    openTime: "07:30:00",
    closeTime: "22:00:00"
};

// Function to convert TimeSpan to HTML time input format
const formatTimeSpanToInput = (timeSpan) => {
    if (!timeSpan) return '';
    const parts = timeSpan.split(':');
    if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
    }
    return timeSpan;
};

// Function to convert HTML time input to TimeSpan format
const formatTimeSpanFromInput = (timeString) => {
    if (!timeString) return null;
    const timeParts = timeString.split(':');
    if (timeParts.length === 2) {
        return `${timeParts[0]}:${timeParts[1]}:00`;
    } else if (timeParts.length === 3) {
        return timeString;
    }
    return `${timeString}:00`;
};

// Test the conversions
console.log('=== Time Format Conversion Test ===');
console.log('Backend data:', backendTimeData);

// Convert for display in HTML inputs
const htmlOpenTime = formatTimeSpanToInput(backendTimeData.openTime);
const htmlCloseTime = formatTimeSpanToInput(backendTimeData.closeTime);

console.log('HTML input format:');
console.log('  openTime:', htmlOpenTime);
console.log('  closeTime:', htmlCloseTime);

// Convert back for sending to backend
const backendOpenTime = formatTimeSpanFromInput(htmlOpenTime);
const backendCloseTime = formatTimeSpanFromInput(htmlCloseTime);

console.log('Backend format (for API):');
console.log('  openTime:', backendOpenTime);
console.log('  closeTime:', backendCloseTime);

// Test with user input from HTML time picker
const userInput = {
    openTime: "09:15",  // User selects 9:15 AM
    closeTime: "18:30"  // User selects 6:30 PM
};

console.log('\n=== User Input Test ===');
console.log('User input:', userInput);

const userBackendOpenTime = formatTimeSpanFromInput(userInput.openTime);
const userBackendCloseTime = formatTimeSpanFromInput(userInput.closeTime);

console.log('Converted for backend:');
console.log('  openTime:', userBackendOpenTime);
console.log('  closeTime:', userBackendCloseTime);

// Test time validation
const parseTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const parts = timeString.split(':');
    if (parts.length >= 2) {
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
};

const openMinutes = parseTimeToMinutes(userInput.openTime);
const closeMinutes = parseTimeToMinutes(userInput.closeTime);
const duration = closeMinutes - openMinutes;

console.log('\n=== Time Validation Test ===');
console.log('Open time in minutes:', openMinutes);
console.log('Close time in minutes:', closeMinutes);
console.log('Duration in minutes:', duration);
console.log('Duration in hours:', (duration / 60).toFixed(1));
console.log('Valid time range:', openMinutes < closeMinutes ? 'Yes' : 'No');
