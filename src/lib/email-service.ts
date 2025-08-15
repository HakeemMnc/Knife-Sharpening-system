import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function sendContactFormEmail(data: ContactFormData) {
  try {
    const { name, email, message } = data;
    
    const result = await resend.emails.send({
      from: 'Northern Rivers Knife Sharpening <noreply@northernriversknifesharpening.com>',
      to: ['hakeem@northernriversknifessharpening.com'],
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #013350; border-bottom: 2px solid #d64f24; padding-bottom: 10px;">
            New Contact Form Message
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #013350; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #d64f24;">${email}</a></p>
            <p><strong>Date:</strong> ${new Date().toLocaleString('en-AU', { 
              timeZone: 'Australia/Sydney',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border-left: 4px solid #d64f24; margin: 20px 0;">
            <h3 style="color: #013350; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #4a5568; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #6b7280; font-size: 14px;">
              This message was sent from the contact form on Northern Rivers Knife Sharpening website.
            </p>
          </div>
        </div>
      `,
      text: `
New Contact Form Message

Contact Details:
Name: ${name}
Email: ${email}
Date: ${new Date().toLocaleString('en-AU', { 
  timeZone: 'Australia/Sydney',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}

Message:
${message}

---
This message was sent from the contact form on Northern Rivers Knife Sharpening website.
      `,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
