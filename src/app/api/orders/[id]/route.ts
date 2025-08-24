import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService, Order } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await DatabaseService.getOrder(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, payment_status, ...otherUpdates } = body;

    // Validate status if provided
    if (status && !['pending', 'paid', 'picked_up', 'sharpening', 'ready', 'delivered', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate payment_status if provided
    if (payment_status && !['unpaid', 'paid', 'refunded', 'failed'].includes(payment_status)) {
      return NextResponse.json(
        { error: 'Invalid payment status' },
        { status: 400 }
      );
    }

                    const updates: Partial<Order> = {};
    if (status) updates.status = status;
    if (payment_status) updates.payment_status = payment_status;
    Object.assign(updates, otherUpdates);

    const updatedOrder = await DatabaseService.updateOrder(orderId, updates);

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Check if order exists before deleting
    const existingOrder = await DatabaseService.getOrder(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    await DatabaseService.deleteOrder(orderId);

    return NextResponse.json({
      success: true,
      message: 'Order permanently deleted'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}
