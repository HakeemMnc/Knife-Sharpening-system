# 🌐 Cloudflare DNS Setup Guide

## **Domain:** northernriversknifesharpening.com

### **Step 1: Access Cloudflare Dashboard**

1. **Go to [cloudflare.com](https://cloudflare.com)**
2. **Log into your account**
3. **Click on your domain** `northernriversknifesharpening.com`

### **Step 2: Navigate to DNS Settings**

1. **Click on "DNS" in the left sidebar**
2. **Click "Records" tab**
3. **You should see an empty list or existing records**

### **Step 3: Add DNS Records**

#### **Record 1: A Record (Root Domain)**
1. **Click "Add record"**
2. **Fill in the details:**
   - **Type:** `A`
   - **Name:** `@` (or leave blank)
   - **IPv4 address:** `76.76.21.21`
   - **Proxy status:** `Proxied` (orange cloud)
   - **TTL:** `Auto`
3. **Click "Save"**

#### **Record 2: CNAME Record (WWW Subdomain)**
1. **Click "Add record" again**
2. **Fill in the details:**
   - **Type:** `CNAME`
   - **Name:** `www`
   - **Target:** `cname.vercel-dns.com`
   - **Proxy status:** `Proxied` (orange cloud)
   - **TTL:** `Auto`
3. **Click "Save"**

### **Step 4: Verify Records**

After adding both records, you should see:

```
Type    Name    Content                    Proxy Status
A       @       76.76.21.21               Proxied
CNAME   www     cname.vercel-dns.com      Proxied
```

### **Step 5: Wait for DNS Propagation**

DNS changes can take up to 24 hours to propagate globally, but usually work within 15-30 minutes.

### **Step 6: Test Your Domain**

Once DNS is configured, your website will be available at:
- **Main domain:** https://northernriversknifesharpening.com
- **WWW subdomain:** https://www.northernriversknifesharpening.com

## 🔧 **Troubleshooting**

### **If DNS isn't working after 30 minutes:**

1. **Check Cloudflare proxy status** - Make sure both records show "Proxied" (orange cloud)
2. **Verify IP address** - Ensure the A record points to `76.76.21.21`
3. **Check CNAME target** - Ensure www points to `cname.vercel-dns.com`
4. **Clear browser cache** - Try incognito/private browsing mode

### **Common Issues:**

- **"This site can't be reached"** - DNS still propagating
- **"Not found" error** - Check DNS record values
- **SSL certificate issues** - Wait for Cloudflare to provision SSL

## 📋 **Next Steps After DNS Setup**

Once DNS is working:

1. **Test your domain** - Visit https://northernriversknifesharpening.com
2. **Update environment variables** - Add new domain to Vercel
3. **Configure webhooks** - Update Stripe webhook URL
4. **Test payment flow** - Ensure payments work on new domain

## 🎯 **Expected Result**

After successful DNS configuration:
- ✅ Domain resolves to your Vercel website
- ✅ HTTPS works automatically
- ✅ Both www and non-www versions work
- ✅ Website loads with your custom domain

---

**Need help?** Check the Cloudflare documentation or contact their support.
