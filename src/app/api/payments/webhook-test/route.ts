import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Webhook test endpoint hit');
  
  const body = await request.text();
  console.log('Webhook test body:', body);
  
  return NextResponse.json({ 
    received: true, 
    timestamp: new Date().toISOString(),
    message: 'Webhook test endpoint is working'
  });
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Webhook test endpoint is running',
    timestamp: new Date().toISOString()
  });
}
