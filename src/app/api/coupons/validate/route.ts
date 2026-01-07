import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// POST - Validate coupon code at checkout (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await DatabaseService.getCouponByCode(code);

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired coupon code' },
        { status: 404 }
      );
    }

    // Return the coupon details for the frontend
    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_percent: coupon.discount_percent,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
