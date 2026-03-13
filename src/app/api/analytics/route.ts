import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/database';

interface OrderRecord {
  payment_status: string;
  created_at: string;
  total_amount: number;
  total_items: number;
  service_level: string;
  postal_code: string;
  [key: string]: string | number | boolean | null | undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Default to current week and month if no dates provided
    const now = new Date();
    const currentWeekStart = getWeekStart(now);
    const currentWeekEnd = getWeekEnd(now);
    const currentMonthStart = getMonthStart(now);
    const currentMonthEnd = getMonthEnd(now);

    // Get all orders for analytics
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate current week revenue
    const weekRevenue = calculateRevenue(allOrders, currentWeekStart, currentWeekEnd);
    
    // Calculate current month revenue  
    const monthRevenue = calculateRevenue(allOrders, currentMonthStart, currentMonthEnd);

    // Calculate custom period revenue if dates provided
    let customRevenue = null;
    if (startDate && endDate) {
      customRevenue = calculateRevenue(allOrders, startDate, endDate);
    }

    // Total paid orders and items (revenue-generating)
    const paidOrders = allOrders.filter(order => order.payment_status === 'paid');
    const totalItemsSharpened = paidOrders.reduce((sum, order) => sum + (order.total_items || 0), 0);

    // Revenue breakdown by service level
    const serviceBreakdown = calculateServiceBreakdown(allOrders, startDate || currentMonthStart, endDate || currentMonthEnd);

    // Geographic insights by postal code
    const geoInsights = calculateGeographicInsights(allOrders, startDate || currentMonthStart, endDate || currentMonthEnd);

    // Daily revenue and order trends
    const dailyTrends = calculateDailyTrends(allOrders, startDate || currentMonthStart, endDate || currentMonthEnd);

    return NextResponse.json({
      success: true,
      analytics: {
        revenue: {
          currentWeek: weekRevenue,
          currentMonth: monthRevenue,
          custom: customRevenue
        },
        orders: {
          totalOrders: allOrders.length,
          paidOrders: paidOrders.length,
          totalItemsSharpened
        },
        serviceBreakdown,
        geoInsights,
        dailyTrends
      }
    });

  } catch (error) {
    console.error('❌ Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper functions
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getWeekEnd(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Sunday end
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getMonthStart(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

function getMonthEnd(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

function calculateRevenue(orders: OrderRecord[], startDate: string, endDate: string): number {
  return orders
    .filter(order => 
      order.payment_status === 'paid' &&
      order.created_at >= startDate &&
      order.created_at <= endDate + 'T23:59:59'
    )
    .reduce((sum, order) => sum + (order.total_amount || 0), 0);
}

function calculateServiceBreakdown(orders: OrderRecord[], startDate: string, endDate: string) {
  const paidOrders = orders.filter(order => 
    order.payment_status === 'paid' &&
    order.created_at >= startDate &&
    order.created_at <= endDate + 'T23:59:59'
  );

  const standard = paidOrders.filter(order => order.service_level === 'standard');
  const premium = paidOrders.filter(order => order.service_level === 'premium');

  return {
    standard: {
      count: standard.length,
      revenue: standard.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    },
    premium: {
      count: premium.length, 
      revenue: premium.reduce((sum, order) => sum + (order.total_amount || 0), 0)
    }
  };
}

function calculateGeographicInsights(orders: OrderRecord[], startDate: string, endDate: string) {
  const paidOrders = orders.filter(order => 
    order.payment_status === 'paid' &&
    order.created_at >= startDate &&
    order.created_at <= endDate + 'T23:59:59'
  );

  const postcodeStats: { [key: string]: { count: number; revenue: number } } = {};
  
  paidOrders.forEach(order => {
    const postcode = order.postal_code || 'Unknown';
    if (!postcodeStats[postcode]) {
      postcodeStats[postcode] = { count: 0, revenue: 0 };
    }
    postcodeStats[postcode].count++;
    postcodeStats[postcode].revenue += order.total_amount || 0;
  });

  return Object.entries(postcodeStats)
    .map(([postcode, stats]) => ({ postcode, ...stats }))
    .sort((a, b) => b.revenue - a.revenue); // Sort by revenue instead of count
}

function calculateDailyTrends(orders: OrderRecord[], startDate: string, endDate: string) {
  const dailyStats: { [key: string]: { revenue: number; orders: number } } = {};
  
  const relevantOrders = orders.filter(order => 
    order.created_at >= startDate &&
    order.created_at <= endDate + 'T23:59:59'
  );

  relevantOrders.forEach(order => {
    const date = order.created_at.split('T')[0];
    if (!dailyStats[date]) {
      dailyStats[date] = { revenue: 0, orders: 0 };
    }
    dailyStats[date].orders++;
    if (order.payment_status === 'paid') {
      dailyStats[date].revenue += order.total_amount || 0;
    }
  });

  return Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}