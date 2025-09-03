import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';
import { SMSService } from '@/lib/sms-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📞 CONTACT API CALLED - Someone submitted contact form!');
    console.log('🔍 Contact API - Received request body:', JSON.stringify(body, null, 2));
    
    // Extract form data
    const { name, phone, message } = body;

    // Validate required fields
    if (!name || !phone || !message) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!phone) missingFields.push('phone');
      if (!message) missingFields.push('message');
      
      console.log('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { error: 'Missing required fields', missing: missingFields },
        { status: 400 }
      );
    }

    // Get client IP and user agent for logging
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if this phone number belongs to an existing customer
    console.log('🔍 Checking if phone number belongs to existing customer');
    const isExistingCustomer = await DatabaseService.isExistingCustomer(phone);
    console.log(`${isExistingCustomer ? '✅ Existing customer detected' : '📝 New contact (potential lead)'}`);

    // Save contact message to database
    console.log('🔍 Saving contact message to database');
    const contactMessage = await DatabaseService.createContactMessage({
      name: name.trim(),
      phone: phone.replace(/\s/g, ''), // Remove spaces
      message_content: message.trim(),
      ip_address: ip,
      user_agent: userAgent,
      is_existing_customer: isExistingCustomer
    });
    console.log('✅ Contact message saved with ID:', contactMessage.id);

    // Send SMS notification to admin
    console.log('🔍 Sending admin SMS notification');
    try {
      const customerType = isExistingCustomer ? 'EXISTING CLIENT' : 'NEW CONTACT';
      const priorityEmoji = isExistingCustomer ? '🔴' : '📞';
      
      const notificationMessage = `${priorityEmoji} ${customerType} MESSAGE\n\n` +
        `From: ${name}\n` +
        `Phone: ${phone}\n` +
        `Type: ${customerType}\n\n` +
        `Message: "${message}"\n\n` +
        `Contact ID: #C${contactMessage.id}\n` +
        `Just copy the number and text them directly!`;
      
      await SMSService.sendAdminNotification(notificationMessage);
      console.log('✅ Admin SMS notification sent successfully');
    } catch (error) {
      console.error('⚠️ Error sending admin SMS notification:', error);
      // Don't fail the contact form submission for this
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Contact message received successfully',
      contactId: contactMessage.id,
      isExistingCustomer
    });

  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to process contact form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}