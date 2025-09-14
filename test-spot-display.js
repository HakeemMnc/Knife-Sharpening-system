/**
 * Test New Spot Display Logic
 * Verify the new threshold-based availability display
 */

function getAvailabilityDisplay(spotsRemaining, isClosed, isFullyBooked) {
  if (isClosed) {
    return { message: "Not available", className: "text-gray-500" };
  }
  
  if (isFullyBooked || spotsRemaining === 0) {
    return { message: "Fully booked", className: "text-gray-500" };
  }
  
  // New threshold logic: only show message when 3 or fewer spots
  if (spotsRemaining <= 3) {
    return { 
      message: `${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} left`, 
      className: "text-red-500 font-medium" 
    };
  }
  
  // 4+ spots: show nothing
  return { message: "", className: "" };
}

console.log('\n🎯 Testing New Spot Display Logic\n');
console.log('='.repeat(50));

// Test cases
const testCases = [
  { spots: 7, closed: false, full: false, expected: 'Nothing shown' },
  { spots: 6, closed: false, full: false, expected: 'Nothing shown' },
  { spots: 5, closed: false, full: false, expected: 'Nothing shown' },
  { spots: 4, closed: false, full: false, expected: 'Nothing shown' },
  { spots: 3, closed: false, full: false, expected: '3 spots left (RED)' },
  { spots: 2, closed: false, full: false, expected: '2 spots left (RED)' },
  { spots: 1, closed: false, full: false, expected: '1 spot left (RED)' },
  { spots: 0, closed: false, full: true, expected: 'Fully booked (GREY)' },
  { spots: 5, closed: true, full: false, expected: 'Not available (GREY)' },
];

testCases.forEach((test, i) => {
  const result = getAvailabilityDisplay(test.spots, test.closed, test.full);
  const display = result.message || '(nothing shown)';
  const color = result.className.includes('red') ? 'RED' : 
               result.className.includes('gray') ? 'GREY' : 'NONE';
  
  console.log(`${i + 1}. ${test.spots} spots${test.closed ? ' (closed)' : ''}${test.full ? ' (full)' : ''}`);
  console.log(`   → Display: "${display}" ${result.message ? `(${color})` : ''}`);
  console.log(`   → Expected: ${test.expected}`);
  
  // Simple validation
  const isCorrect = (
    (test.spots >= 4 && !test.closed && !test.full && result.message === '') ||
    (test.spots <= 3 && !test.closed && !test.full && result.message.includes('spot') && result.className.includes('red')) ||
    (test.full && result.message === 'Fully booked' && result.className.includes('gray')) ||
    (test.closed && result.message === 'Not available' && result.className.includes('gray'))
  );
  
  console.log(`   ✅ ${isCorrect ? 'CORRECT' : '❌ INCORRECT'}\n`);
});

console.log('🎯 Test Summary:');
console.log('- 4+ spots: No message shown (clean interface)');
console.log('- 3,2,1 spots: Red urgency messages');
console.log('- 0 spots/full: Grey "Fully booked"');
console.log('- Closed days: Grey "Not available"');