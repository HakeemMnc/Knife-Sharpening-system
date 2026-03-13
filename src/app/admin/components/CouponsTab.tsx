'use client';

import { useState, useEffect } from 'react';

interface Coupon {
  id: number;
  code: string;
  discount_percent: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('');
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [savingCoupon, setSavingCoupon] = useState(false);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/coupons');
      if (!response.ok) throw new Error('Failed to fetch coupons');
      const result = await response.json();
      if (result.success) {
        setCoupons(result.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const createCoupon = async () => {
    if (!newCouponCode || !newCouponPercent) {
      alert('Please enter a coupon code and discount percentage');
      return;
    }

    const percent = parseInt(newCouponPercent, 10);
    if (isNaN(percent) || percent < 1 || percent > 100) {
      alert('Discount percentage must be between 1 and 100');
      return;
    }

    setSavingCoupon(true);
    try {
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discount_percent: percent,
          description: newCouponDescription || null,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create coupon');
      }

      await fetchCoupons();
      setNewCouponCode('');
      setNewCouponPercent('');
      setNewCouponDescription('');
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert(error instanceof Error ? error.message : 'Failed to create coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const updateCoupon = async (id: number, updates: { code?: string; discount_percent?: number; description?: string; is_active?: boolean }) => {
    setSavingCoupon(true);
    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update coupon');
      }

      await fetchCoupons();
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert(error instanceof Error ? error.message : 'Failed to update coupon');
    } finally {
      setSavingCoupon(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      await fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const toggleCouponActive = async (coupon: Coupon) => {
    await updateCoupon(coupon.id, { is_active: !coupon.is_active });
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold">Coupon Management</h2>
        <button
          onClick={fetchCoupons}
          className="bg-blue-600 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-blue-700 text-sm md:text-base"
        >
          Refresh
        </button>
      </div>

      {/* Add New Coupon Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-md font-medium mb-4">Create New Coupon</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              placeholder="e.g. WELCOME25"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
            <input
              type="number"
              placeholder="25"
              min="1"
              max="100"
              value={newCouponPercent}
              onChange={(e) => setNewCouponPercent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. 25% off first order"
              value={newCouponDescription}
              onChange={(e) => setNewCouponDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={createCoupon}
              disabled={savingCoupon || !newCouponCode || !newCouponPercent}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingCoupon ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Coupons List */}
      <div className="space-y-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            {editingCoupon?.id === coupon.id ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      value={editingCoupon.code}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editingCoupon.discount_percent}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_percent: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={editingCoupon.description || ''}
                      onChange={(e) => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingCoupon(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateCoupon(coupon.id, {
                      code: editingCoupon.code,
                      discount_percent: editingCoupon.discount_percent,
                      description: editingCoupon.description,
                    })}
                    disabled={savingCoupon}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingCoupon ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-gray-900">{coupon.code}</span>
                    <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                      {coupon.discount_percent}% off
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      coupon.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(coupon.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCouponActive(coupon)}
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      coupon.is_active
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {coupon.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => setEditingCoupon({ ...coupon })}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {coupons.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-gray-600">No coupons found. Create your first coupon above!</div>
          </div>
        )}
      </div>
    </div>
  );
}
