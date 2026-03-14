'use client';

import { useState, useEffect } from 'react';
import type { ServiceContract, Client, ContractStatus, ContractFrequency, DayOfWeek } from '@/types/b2b';

interface ContractFormData {
  client_id: string;
  frequency: ContractFrequency;
  day_of_week: DayOfWeek | '';
  price_per_visit: string;
  estimated_knives_per_visit: number;
  start_date: string;
  end_date: string;
}

const emptyForm: ContractFormData = {
  client_id: '',
  frequency: 'weekly',
  day_of_week: '',
  price_per_visit: '',
  estimated_knives_per_visit: 10,
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
};

export default function ContractsTab() {
  const [contracts, setContracts] = useState<ServiceContract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContractFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/b2b/contracts?status=${statusFilter}`
        : '/api/b2b/contracts';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) setContracts(result.data);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/b2b/clients?status=active');
      const result = await response.json();
      if (result.success) setClients(result.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, [statusFilter]);

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!form.client_id) {
      setError('Please select a client');
      return;
    }
    if (!form.price_per_visit || parseFloat(form.price_per_visit) <= 0) {
      setError('Price per visit is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        client_id: form.client_id,
        frequency: form.frequency,
        day_of_week: form.day_of_week || null,
        price_per_visit: parseFloat(form.price_per_visit),
        estimated_knives_per_visit: form.estimated_knives_per_visit,
        start_date: form.start_date,
        end_date: form.end_date || null,
        status: editingId ? undefined : 'active',
      };

      const url = editingId ? `/api/b2b/contracts/${editingId}` : '/api/b2b/contracts';
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to save contract');
        return;
      }

      setShowForm(false);
      fetchContracts();
    } catch {
      setError('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const updateContractStatus = async (id: string, status: ContractStatus) => {
    try {
      await fetch(`/api/b2b/contracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchContracts();
    } catch (err) {
      console.error('Failed to update contract:', err);
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.business_name || 'Unknown Client';
  };

  const statusBadge = (status: ContractStatus) => {
    const colors: Record<ContractStatus, string> = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-600',
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
        <h2 className="text-lg font-semibold">Service Contracts</h2>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ContractStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={openNewForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + New Contract
          </button>
        </div>
      </div>

      {/* Contract Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? 'Edit Contract' : 'New Contract'}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select
                  value={form.client_id}
                  onChange={e => setForm(prev => ({ ...prev, client_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.business_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={e => setForm(prev => ({ ...prev, frequency: e.target.value as ContractFrequency }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                    <option value="on_demand">On Demand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Day</label>
                  <select
                    value={form.day_of_week}
                    onChange={e => setForm(prev => ({ ...prev, day_of_week: e.target.value as DayOfWeek | '' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Not set</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Visit ($) *</label>
                  <input
                    type="number"
                    value={form.price_per_visit}
                    onChange={e => setForm(prev => ({ ...prev, price_per_visit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    step="0.01"
                    min="0"
                    placeholder="50.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Knives/Visit</label>
                  <input
                    type="number"
                    value={form.estimated_knives_per_visit}
                    onChange={e => setForm(prev => ({ ...prev, estimated_knives_per_visit: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
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
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contract List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">No contracts yet</p>
          <p className="text-sm text-gray-500">Create a contract to set up recurring service for a client.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(contract => (
            <div
              key={contract.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {getClientName(contract.client_id)}
                    </h3>
                    {statusBadge(contract.status)}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    <span className="capitalize">{contract.frequency}</span>
                    {contract.day_of_week && (
                      <span className="capitalize">{contract.day_of_week}s</span>
                    )}
                    <span>${contract.price_per_visit}/visit</span>
                    <span>~{contract.estimated_knives_per_visit} knives</span>
                    <span>Since {new Date(contract.start_date).toLocaleDateString()}</span>
                    {contract.stripe_subscription_id ? (
                      <span className="text-green-600 font-medium">Billing Active</span>
                    ) : contract.status === 'active' ? (
                      <span className="text-yellow-600">No billing linked</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {contract.status === 'active' && (
                    <button
                      onClick={() => updateContractStatus(contract.id, 'paused')}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      Pause
                    </button>
                  )}
                  {contract.status === 'paused' && (
                    <button
                      onClick={() => updateContractStatus(contract.id, 'active')}
                      className="text-green-600 hover:text-green-800 text-sm font-medium"
                    >
                      Resume
                    </button>
                  )}
                  {contract.status !== 'cancelled' && (
                    <button
                      onClick={() => updateContractStatus(contract.id, 'cancelled')}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
