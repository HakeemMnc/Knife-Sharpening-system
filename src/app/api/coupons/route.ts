import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// GET - List all coupons (admin)
export async function GET() {
  try {
    const coupons = await DatabaseService.getCoupons();
    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST - Create new coupon (admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discount_percent, description } = body;

    // Validate required fields
    if (!code || !discount_percent) {
      return NextResponse.json(
        { success: false, error: 'Code and discount percentage are required' },
        { status: 400 }
      );
    }

    // Validate discount percentage
    if (discount_percent < 1 || discount_percent > 100) {
      return NextResponse.json(
        { success: false, error: 'Discount percentage must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate code format (alphanumeric and underscores only)
    if (!/^[A-Za-z0-9_]+$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Coupon code can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    const coupon = await DatabaseService.createCoupon({
      code,
      discount_percent,
      description,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
