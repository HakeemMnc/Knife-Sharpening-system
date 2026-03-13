'use client';

import { useState, useEffect } from 'react';
import type { Client, ClientStatus, DayOfWeek, TimeWindow } from '@/types/b2b';

interface ClientFormData {
  business_name: string;
  contact_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  suburb: string;
  state: string;
  postal_code: string;
  preferred_day: DayOfWeek | '';
  preferred_time_window: TimeWindow | '';
  access_instructions: string;
  billing_email: string;
  payment_terms: number;
  notes: string;
}

const emptyForm: ClientFormData = {
  business_name: '',
  contact_name: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  suburb: '',
  state: '',
  postal_code: '',
  preferred_day: '',
  preferred_time_window: '',
  access_instructions: '',
  billing_email: '',
  payment_terms: 30,
  notes: '',
};

export default function ClientsTab() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/b2b/clients?status=${statusFilter}`
        : '/api/b2b/clients';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setClients(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const openEditForm = (client: Client) => {
    setForm({
      business_name: client.business_name,
      contact_name: client.contact_name || '',
      email: client.email || '',
      phone: client.phone || '',
      address_line1: client.address_line1 || '',
      address_line2: client.address_line2 || '',
      suburb: client.suburb || '',
      state: client.state || '',
      postal_code: client.postal_code || '',
      preferred_day: client.preferred_day || '',
      preferred_time_window: client.preferred_time_window || '',
      access_instructions: client.access_instructions || '',
      billing_email: client.billing_email || '',
      payment_terms: client.payment_terms,
      notes: client.notes || '',
    });
    setEditingId(client.id);
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.business_name.trim()) {
      setError('Business name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        preferred_day: form.preferred_day || null,
        preferred_time_window: form.preferred_time_window || null,
      };

      const url = editingId ? `/api/b2b/clients/${editingId}` : '/api/b2b/clients';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to save client');
        return;
      }

      setShowForm(false);
      fetchClients();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/b2b/clients/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchClients();
      }
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  const statusBadge = (status: ClientStatus) => {
    const colors: Record<ClientStatus, string> = {
      prospect: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-gray-100 text-gray-800',
      churned: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Commercial Clients</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ClientStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="prospect">Prospects</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
          <button
            onClick={openNewForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Client' : 'New Client'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={e => setForm(prev => ({ ...prev, business_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. The Rusty Anchor Restaurant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={e => setForm(prev => ({ ...prev, contact_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={form.billing_email}
                  onChange={e => setForm(prev => ({ ...prev, billing_email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address_line1}
                  onChange={e => setForm(prev => ({ ...prev, address_line1: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Street address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suburb</label>
                <input
                  type="text"
                  value={form.suburb}
                  onChange={e => setForm(prev => ({ ...prev, suburb: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. NSW"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={e => setForm(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (days)</label>
                <input
                  type="number"
                  value={form.payment_terms}
                  onChange={e => setForm(prev => ({ ...prev, payment_terms: parseInt(e.target.value) || 30 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Day</label>
                <select
                  value={form.preferred_day}
                  onChange={e => setForm(prev => ({ ...prev, preferred_day: e.target.value as DayOfWeek | '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">No preference</option>
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                <select
                  value={form.preferred_time_window}
                  onChange={e => setForm(prev => ({ ...prev, preferred_time_window: e.target.value as TimeWindow | '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">No preference</option>
                  <option value="morning">Morning (8am-12pm)</option>
                  <option value="midday">Midday (11am-2pm)</option>
                  <option value="afternoon">Afternoon (1pm-5pm)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Instructions</label>
                <input
                  type="text"
                  value={form.access_instructions}
                  onChange={e => setForm(prev => ({ ...prev, access_instructions: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g. Ring bell at back door, ask for chef"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">No clients yet</p>
          <p className="text-sm text-gray-500">Add your first commercial client to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(client => (
            <div
              key={client.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{client.business_name}</h3>
                    {statusBadge(client.status)}
                  </div>
                  {client.contact_name && (
                    <p className="text-sm text-gray-600 mt-1">{client.contact_name}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    {client.phone && <span>{client.phone}</span>}
                    {client.suburb && <span>{client.suburb}, {client.state} {client.postal_code}</span>}
                    {client.preferred_day && (
                      <span className="capitalize">Prefers: {client.preferred_day}s</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openEditForm(client)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(client.id, client.business_name)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
