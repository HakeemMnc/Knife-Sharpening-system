# Email Setup Guide - Contact Form

This guide will help you set up email forwarding for the contact form to send messages to `hakeem@northernriversknifessharpening.com`.

## Prerequisites

- A Resend account (free tier available)
- Access to your domain's DNS settings

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Verify your email address
3. Complete the account setup

## Step 2: Get Your API Key

1. In your Resend dashboard, go to the "API Keys" section
2. Click "Create API Key"
3. Give it a name like "Northern Rivers Knife Sharpening"
4. Copy the API key (it starts with `re_`)

## Step 3: Add API Key to Environment Variables

1. Add the API key to your `.env.local` file:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```

2. If deploying to production, add the same environment variable to your hosting platform (Vercel, Netlify, etc.)

## Step 4: Verify Your Domain (Optional but Recommended)

For better deliverability, you should verify your domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `northernriversknifesharpening.com`)
4. Add the required DNS records to your domain provider
5. Wait for verification (usually takes a few minutes)

## Step 5: Test the Contact Form

1. Start your development server: `npm run dev`
2. Go to the contact form on your website
3. Fill out the form and submit
4. Check that you receive the email at `hakeem@northernriversknifessharpening.com`

## Email Format

The contact form emails will include:
- **Subject**: "New Contact Form Message from [Name]"
- **From**: "Northern Rivers Knife Sharpening <noreply@northernriversknifesharpening.com>"
- **To**: hakeem@northernriversknifessharpening.com
- **Content**: 
  - Contact details (name, email, date)
  - The customer's message
  - Professional formatting with your brand colors

## Troubleshooting

### Emails not sending
1. Check that `RESEND_API_KEY` is set correctly
2. Verify the API key is valid in your Resend dashboard
3. Check the browser console and server logs for errors

### Emails going to spam
1. Verify your domain in Resend
2. Set up proper SPF and DKIM records
3. Use a verified domain for the "from" address

### Rate limiting
- Resend free tier allows 3,000 emails per month
- Paid plans start at $20/month for 50,000 emails

## Security Notes

- The API key should never be exposed in client-side code
- All email sending happens server-side in the API route
- Form validation prevents spam and malicious content
- Rate limiting is handled by Resend

## Support

If you need help with Resend setup, check their documentation at [resend.com/docs](https://resend.com/docs) or contact their support team.
