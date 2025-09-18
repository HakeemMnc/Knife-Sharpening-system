# Domain Migration Analysis
## From: northern-rivers-knifes-sharpening.com (with typo)
## To: northern-rivers-knife-sharpening.com (correct)

---

## 🔍 COMPREHENSIVE ANALYSIS RESULTS

### 📁 1. CODE & CONFIGURATION FILES

#### Environment Variables (.env.local)
- **Line 3**: `NEXT_PUBLIC_APP_URL=https://northernriversknifessharpening.com`
- **Line 25**: `NEXTAUTH_URL=http://localhost:3000` (needs updating for production)

#### Email Service Configuration (src/lib/email-service.ts)
- **Line 16**: From email: `noreply@northernriversknifesharpening.com`
- **Line 17**: To email: `hakeem@northernriversknifessharpening.com`
- **Line 46**: Email template text mentions "Northern Rivers Knife Sharpening website"
- **Line 70**: Plain text email mentions "Northern Rivers Knife Sharpening website"

#### QR Code Generation (generate-qr-codes.js)
- **Line 5**: URL hardcoded as `https://northernriversknifessharpening.com/`
- **Impact**: All generated QR codes point to old domain
- **Physical Impact**: Any printed materials with QR codes need reprinting

#### Stripe Webhook Configuration (check-webhooks.js)
- **Line 16**: Documentation URL: `https://northernriversknifessharpening.com/api/payments/webhook`
- **Line 31**: Expected webhook URL: `https://northernriversknifessharpening.com/api/payments/webhook`

#### Documentation Files
- **EMAIL-SETUP-GUIDE.md**:
  - Line 3: Email address `hakeem@northernriversknifessharpening.com`
  - Line 47: Email verification step
  - Line 54: To email address

---

## 🌐 2. EXTERNAL SERVICES CONFIGURATION

### Vercel Deployment
- **Domain Settings**: Need to update domain configuration in Vercel dashboard
- **Environment Variables**: Update NEXT_PUBLIC_APP_URL in Vercel environment settings
- **DNS Configuration**: Point new domain to Vercel servers
- **SSL Certificate**: Will be auto-generated for new domain

### Stripe Configuration
- **Webhook Endpoints**: Update webhook URL from old domain to new domain
- **Dashboard Location**: https://dashboard.stripe.com/webhooks
- **Current Webhook**: `https://northernriversknifessharpening.com/api/payments/webhook`
- **New Webhook**: `https://northern-rivers-knife-sharpening.com/api/payments/webhook`

### Supabase Configuration
- **Allowed URLs**: Update redirect URLs in Authentication settings
- **CORS Settings**: Add new domain to allowed origins

### Email Service (Resend/Domain Email)
- **DNS Records**: Update MX, SPF, DKIM records for new domain
- **Email Addresses**:
  - Change from: `noreply@northernriversknifessharpening.com`
  - Change from: `hakeem@northernriversknifessharpening.com`
  - To: `noreply@northern-rivers-knife-sharpening.com`
  - To: `hakeem@northern-rivers-knife-sharpening.com`

### Twilio Configuration
- **Webhook URLs**: If any SMS webhooks use the domain, update them

---

## 📱 3. PHYSICAL & MARKETING MATERIALS

### QR Codes
- **Current**: All QR codes point to `https://northernriversknifessharpening.com/`
- **Impact**: Need to regenerate and reprint all physical materials with QR codes
- **Files**: Located in `qr-codes-for-print/` directory

### Business Materials
- Business cards (if domain is printed)
- Flyers
- Vehicle signage
- Uniforms/shirts
- Invoices/receipts

---

## 🔄 4. REDIRECT STRATEGY

### Critical Requirement
- Set up 301 permanent redirect from old domain to new domain
- Maintain both domains for at least 1 year to prevent loss of traffic

---

## 📋 5. MIGRATION CHECKLIST

### Phase 1: Preparation
- [ ] Verify ownership of new domain
- [ ] Keep old domain active (don't let it expire!)
- [ ] Backup current production environment
- [ ] Test deployment on staging environment

### Phase 2: External Services
- [ ] Update Vercel domain settings
- [ ] Update Stripe webhook endpoints
- [ ] Update Supabase allowed URLs
- [ ] Configure email DNS records for new domain
- [ ] Update Twilio webhooks (if applicable)

### Phase 3: Code Updates
- [ ] Update .env.local file
- [ ] Update email service configuration
- [ ] Update QR code generation script
- [ ] Update webhook verification scripts
- [ ] Update documentation files

### Phase 4: Deployment
- [ ] Deploy code changes to Vercel
- [ ] Verify environment variables in Vercel
- [ ] Test all functionality on new domain
- [ ] Set up 301 redirect from old to new domain

### Phase 5: Physical Materials
- [ ] Generate new QR codes
- [ ] Plan replacement of printed materials
- [ ] Update any offline references

### Phase 6: Verification
- [ ] Test payment processing
- [ ] Test email sending
- [ ] Test contact form
- [ ] Test SMS notifications
- [ ] Verify QR codes redirect correctly
- [ ] Check SSL certificate is active

---

## ⚠️ CRITICAL NOTES

1. **DO NOT let the old domain expire** - Keep it active and redirecting for at least 1 year
2. **Update Stripe webhooks BEFORE going live** - Payment processing will fail otherwise
3. **Test everything in staging first** - Use a test subdomain if possible
4. **Email configuration is critical** - Update DNS records before changing code
5. **QR codes in circulation** - Old QR codes will only work if redirect is properly set up

---

## 📊 RISK ASSESSMENT

### High Risk Items
- Stripe webhook configuration (payments will fail)
- Email DNS configuration (emails won't be delivered)
- Loss of old domain (traffic loss, broken QR codes)

### Medium Risk Items
- SEO impact (temporary ranking fluctuation)
- Customer confusion during transition

### Low Risk Items
- Documentation updates
- Internal references

---

## 🚀 RECOMMENDED MIGRATION ORDER

1. **Day 1**: Configure new domain DNS, point to Vercel
2. **Day 2**: Update all external services (Stripe, Supabase, Email)
3. **Day 3**: Deploy code changes with new domain references
4. **Day 4**: Set up 301 redirect from old to new domain
5. **Day 5-7**: Monitor and test all functionality
6. **Week 2**: Begin updating physical materials

---

## 📝 NOTES

The typo appears to be consistent throughout the system as "knifes" (with 's') instead of "knife" (without 's'). The analysis found NO references to "northern-rivers-knifes-sharpening" in the codebase, but multiple references to "northernriversknifessharpening" (without hyphens but with the 's' typo).

This suggests the actual domain in use might be "northernriversknifessharpening.com" rather than "northern-rivers-knifes-sharpening.com". Please verify the exact current domain name before proceeding with migration.