# Current Service Date Logic Analysis

## Overview
Today = Friday, September 5th, 2025
Tomorrow = Saturday, September 6th, 2025

## Current Implementation Logic

### Step 1: Basic Setup
- **Rule**: No same-day booking (start from tomorrow)
- **Target**: Return exactly 6 dates per postcode
- **Start Date**: Always tomorrow (Saturday Sept 6th)

### Step 2: Service Day Detection
For each postcode, the system:
1. Gets the service days (e.g., ['Tuesday', 'Friday'])
2. Checks if tomorrow (Saturday) is in the service days
3. Sets alternatingIndex based on this check

### Step 3: Date Generation Loop
- Loops for up to 10 weeks
- For each week, tries to find 2 dates (alternating between service days)
- For each target service day, searches up to 14 days ahead
- Calls `/api/admin/booking-limits` to check availability
- Adds dates to result array

## What Happens for Each Postcode

### Service Area 1: MONDAY & THURSDAY
**Postcodes: 2481 (Byron Bay), 2479 (Bangalow)**

**Step-by-step:**
1. Start Date: Saturday Sept 6th
2. Service Days: [Monday, Thursday] → indices [1, 4]
3. Tomorrow Check: Saturday (6) not in [1, 4] → alternatingIndex = 0 (start with Monday)
4. Date Search:
   - Look for Monday starting from Saturday Sept 6th → finds Monday Sept 9th
   - Look for Thursday starting from Tuesday Sept 10th → finds Thursday Sept 12th
   - Look for Monday starting from Friday Sept 13th → finds Monday Sept 16th
   - And so on...

**Expected Result:**
Monday 9th, Thursday 12th, Monday 16th, Thursday 19th, Monday 23rd, Thursday 26th

### Service Area 2: TUESDAY & FRIDAY  
**Postcodes: 2482 (Mullumbimby), 2483 (Brunswick Heads), 2489 (Pottsville)**

**Step-by-step:**
1. Start Date: Saturday Sept 6th
2. Service Days: [Tuesday, Friday] → indices [2, 5]
3. Tomorrow Check: Saturday (6) not in [2, 5] → alternatingIndex = 0 (start with Tuesday)
4. Date Search:
   - Look for Tuesday starting from Saturday Sept 6th → finds Tuesday Sept 10th
   - Look for Friday starting from Wednesday Sept 11th → finds Friday Sept 13th
   - Look for Tuesday starting from Saturday Sept 14th → finds Tuesday Sept 17th
   - And so on...

**Expected Result:**
Tuesday 10th, Friday 13th, Tuesday 17th, Friday 20th, Tuesday 24th, Friday 27th

### Service Area 3: WEDNESDAY & SATURDAY
**Postcodes: 2478 (Ballina), 2477 (Alstonville)**

**Step-by-step:**
1. Start Date: Saturday Sept 6th
2. Service Days: [Wednesday, Saturday] → indices [3, 6]
3. Tomorrow Check: Saturday (6) IS IN [3, 6] → alternatingIndex = 1 (start with Saturday!)
4. Date Search:
   - Look for Saturday starting from Saturday Sept 6th → finds Saturday Sept 6th (tomorrow!)
   - Look for Wednesday starting from Sunday Sept 7th → finds Wednesday Sept 11th
   - Look for Saturday starting from Thursday Sept 12th → finds Saturday Sept 14th
   - And so on...

**Expected Result:**
Saturday 6th, Wednesday 11th, Saturday 14th, Wednesday 18th, Saturday 21st, Wednesday 25th

## Key Issues Identified

### Issue 1: Booking Limits API Call
The system calls `/api/admin/booking-limits?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` for each date.
- **YOU MENTIONED**: Limits are per SERVICE AREA, not per postcode
- **CURRENT CODE**: Might be treating each postcode separately

### Issue 2: Default Values
When no booking limit data exists, it defaults to:
- `spotsRemaining: 7`
- `availabilityStatus: 'available'`

### Issue 3: Shared Capacity Logic
- **YOUR SYSTEM**: If someone books Pottsville (2489), it reduces spots for Mullumbimby (2482) and Brunswick Heads (2483) because they're the same service area (Tue/Fri)
- **CURRENT CODE**: May not be handling this shared capacity correctly

## Questions for You

1. **Booking Limits**: When I call `/api/admin/booking-limits`, does it return limits per SERVICE AREA or per individual postcode?

2. **Shared Capacity**: If someone books a Tuesday slot for Pottsville (2489), should it reduce available spots for Mullumbimby (2482) on the same Tuesday?

3. **Current Problem**: Which specific postcode are you testing, and what dates are you seeing vs. what you expect to see?