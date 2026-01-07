import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/database';

// PUT - Update coupon (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponId = parseInt(id, 10);

    if (isNaN(couponId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { code, discount_percent, description, is_active } = body;

    // Build updates object
    const updates: Record<string, unknown> = {};

    if (code !== undefined) {
      if (!/^[A-Za-z0-9_]+$/.test(code)) {
        return NextResponse.json(
          { success: false, error: 'Coupon code can only contain letters, numbers, and underscores' },
          { status: 400 }
        );
      }
      updates.code = code.toUpperCase();
    }

    if (discount_percent !== undefined) {
      if (discount_percent < 1 || discount_percent > 100) {
        return NextResponse.json(
          { success: false, error: 'Discount percentage must be between 1 and 100' },
          { status: 400 }
        );
      }
      updates.discount_percent = discount_percent;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (is_active !== undefined) {
      updates.is_active = is_active;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      );
    }

    const coupon = await DatabaseService.updateCoupon(couponId, updates);
    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);

    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { success: false, error: 'A coupon with this code already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

// DELETE - Delete coupon (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const couponId = parseInt(id, 10);

    if (isNaN(couponId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon ID' },
        { status: 400 }
      );
    }

    await DatabaseService.deleteCoupon(couponId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}
