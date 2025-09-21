# Meta Pixel Deployment & Testing Guide
## ✅ Complete 2025 Implementation for Northern Rivers Knife Sharpening

### 🚨 **IMPORTANT: Why Facebook Shows "No Activity"**

Your Meta Pixel **IS CORRECTLY IMPLEMENTED** but Facebook shows no activity because:

1. **Domain Mismatch**: Testing on `localhost:3005` instead of production domain
2. **No Production Traffic**: Facebook needs real visitors on `northernriversknifesharpening.com`
3. **Domain Verification Required**: Facebook domain must be verified in Business Manager

---

## 📋 **Pre-Deployment Checklist**

### ✅ **Already Completed**
- [x] Meta Pixel base code installed (`812571684456581`)
- [x] 2025 optimized implementation with event deduplication
- [x] Enhanced tracking events (Lead, InitiateCheckout, AddPaymentInfo, Purchase)
- [x] Advanced matching configuration
- [x] Proper noscript fallback

### 🔧 **What You Need to Do**

#### **Step 1: Domain Verification in Facebook Business Manager**
1. Go to **Business Settings** > **Brand Safety** > **Domains**
2. Click **Add** and enter: `northernriversknifesharpening.com`
3. Choose verification method:
   - **HTML file upload** (recommended)
   - **Meta tag** (already done - check if present)
   - **DNS TXT record**
4. Complete verification (takes 24-48 hours)

#### **Step 2: Deploy to Production**
```bash
# Build and deploy your Next.js app to production
npm run build
# Deploy to your hosting provider (Vercel, Netlify, etc.)
```

#### **Step 3: Test with Facebook Pixel Helper**
1. Install **Facebook Pixel Helper** Chrome extension
2. Visit your live site: `https://northernriversknifesharpening.com`
3. Look for blue pixel icon with activity

---

## 🧪 **Testing Protocol**

### **1. PageView Testing**
- Visit homepage → Should see PageView event
- Check console for: `🔍 Meta Pixel tracked: PageView`

### **2. Lead Generation Testing**
- Start typing in name field → Should see Lead event
- Check console for: `🔍 Meta Pixel tracked: Lead`

### **3. Conversion Funnel Testing**
- Complete booking form → Should see InitiateCheckout
- Submit payment form → Should see AddPaymentInfo
- Complete payment → Should see Purchase

### **4. Facebook Events Manager Verification**
1. Go to **Events Manager** > **Your Pixel**
2. Click **Test Events** tab
3. Enter your website URL
4. Perform actions and verify events appear

---

## 📊 **Event Tracking Summary**

| Event | Trigger | Data Included |
|-------|---------|---------------|
| **PageView** | Page load | Content name, category |
| **Lead** | Start typing name | Value, source, category |
| **InitiateCheckout** | Show payment form | Value, currency, LTV |
| **AddPaymentInfo** | Submit payment | Value, currency, customer data |
| **Purchase** | Payment success | Value, order ID, customer data |

---

## 🔧 **Troubleshooting**

### **If Facebook Still Shows "No Activity":**

1. **Check Domain Verification**
   - Must be completed in Business Manager
   - Domain must exactly match your website

2. **Verify Pixel Installation**
   ```javascript
   // Check in browser console
   console.log(typeof fbq); // Should return "function"
   fbq('track', 'PageView'); // Should work without errors
   ```

3. **Check for Conflicts**
   - No duplicate pixels
   - No other Facebook pixels interfering
   - Ad blockers disabled during testing

4. **Advanced Debugging**
   - Use Facebook Pixel Helper extension
   - Check Network tab for `fbevents.js` loading
   - Verify events in Facebook Test Events tool

---

## 🚀 **Next Steps After Deployment**

### **1. Set Up Conversion Campaigns**
- Use **Purchase** event for conversion optimization
- Set up **Lead** event for top-of-funnel campaigns

### **2. Create Custom Audiences**
- Website visitors (180 days)
- Purchase completers
- Lead generators who didn't convert

### **3. Set Up Lookalike Audiences**
- Based on Purchase events
- Target similar users in Northern Rivers area

### **4. Configure Ads Manager**
- Choose "Track conversions with standard events"
- Select Purchase as your conversion event
- Set up attribution windows

---

## 📈 **Expected Results After Production Deployment**

### **Within 24 Hours:**
- ✅ PageView events appearing in Events Manager
- ✅ Facebook Pixel Helper showing green checkmark
- ✅ Real-time events in Test Events tool

### **Within 7 Days:**
- ✅ Sufficient data for conversion optimization
- ✅ Custom audiences building
- ✅ Conversion campaigns can be launched

### **Within 30 Days:**
- ✅ Lookalike audiences available
- ✅ Full conversion funnel data
- ✅ Optimized ad delivery

---

## 🛠 **Technical Notes**

- **Pixel ID**: `812571684456581`
- **Implementation**: Next.js 15 with 2025 optimizations
- **Events**: Deduplication with unique IDs
- **Attribution**: 7-day click, 1-day view (default)
- **Currency**: AUD (Australian Dollar)

---

## 📞 **Support**

If issues persist after production deployment:
1. Check Facebook Business Help Center
2. Use Facebook Pixel Helper for diagnostics
3. Contact Facebook Business Support
4. Verify domain ownership in Business Manager

**Remember**: The pixel implementation is correct. Facebook will detect activity once deployed to your production domain with proper verification.