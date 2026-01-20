import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Table, StatusBadge } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormInput, FormSelect } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { api } from '../utils/api';
import { Subscription } from '../types';
import { usePermissions } from '../hooks/usePermissions';

type SubscriptionStatus = Subscription['status'];
type SubscriptionType = Subscription['type'];

interface SubscriptionFormData {
  user_name: string;
  user_email: string;
  bus_line_id: string;
  type: SubscriptionType;
  start_date: string;
  end_date: string;
  price: string;
  status: SubscriptionStatus;
}

const SUBSCRIPTION_TYPES: SubscriptionType[] = ['weekly', 'monthly', 'yearly'];
const SUBSCRIPTION_STATUS: SubscriptionStatus[] = ['active', 'expired', 'cancelled'];

const getSubscriptionId = (sub: Subscription | Record<string, unknown>) => {
  const source = sub as Record<string, unknown>;
  const rawId =
    source['id_subscription'] ||
    source['ID_SUBSCRIPTION'] ||
    source['id'] ||
    source['ID'];

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const getBusLineId = (line: { id?: string; [key: string]: unknown }) => {
  const source = line as Record<string, unknown>;
  const rawId =
    source['id_line'] ||
    source['ID_LINE'] ||
    source['id_bus_line'] ||
    source['ID_BUS_LINE'] ||
    source['id'] ||
    source['ID'];

  if (rawId === undefined || rawId === null) return '';
  return String(rawId);
};

const normalizeDateForInput = (value?: string | null) => {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return '';
};

const formatDateForOracle = (value: string) => {
  if (!value) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
};

export function Subscriptions() {
  const { subscriptions, busLines, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('subscriptions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<SubscriptionFormData>({
    user_name: '',
    user_email: '',
    bus_line_id: '',
    type: 'monthly',
    start_date: '',
    end_date: '',
    price: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate bus line selection
      if (!formData.bus_line_id || formData.bus_line_id.trim() === '') {
        throw new Error('Please select a bus line');
      }

      // Validate that the selected bus line exists
      const busLineIdStr = formData.bus_line_id.trim();
      const selectedBusLine = busLines.find((line) => getBusLineId(line) === busLineIdStr);
      if (!selectedBusLine) {
        throw new Error('Please select a valid bus line');
      }

      // Convert bus_line_id to number for Oracle (handle hex strings)
      let busLineId: number;
      if (/^[0-9A-Fa-f]+$/.test(busLineIdStr) && busLineIdStr.length > 2) {
        // Hex string - convert to number
        busLineId = parseInt(busLineIdStr, 16);
        if (Number.isNaN(busLineId)) {
          throw new Error('Invalid bus line ID format');
        }
      } else {
        // Regular number string
        busLineId = Number(busLineIdStr);
        if (Number.isNaN(busLineId) || busLineId <= 0) {
          throw new Error('Bus line must be a valid number');
        }
      }

      // Validate price
      if (!formData.price || formData.price.trim() === '') {
        throw new Error('Price is required');
      }

      const priceValue = Number(formData.price);
      if (Number.isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      const payload = {
        user_name: formData.user_name.trim(),
        user_email: formData.user_email.trim(),
        bus_line_id: busLineId, // Number for Oracle NUMBER column
        type: formData.type,
        start_date: formatDateForOracle(formData.start_date),
        end_date: formatDateForOracle(formData.end_date),
        price: priceValue,
        status: formData.status,
      };

      if (editingSub) {
        const subscriptionId = getSubscriptionId(editingSub);
        if (!subscriptionId) {
          throw new Error('Subscription ID missing, cannot update');
        }
        const { error } = await api
          .from('subscriptions')
          .update(payload)
          .eq('id', subscriptionId);
        if (error) throw new Error(error);
        showToast('Subscription updated successfully', 'success');
      } else {
        const { error } = await api.from('subscriptions').insert(payload);
        if (error) throw new Error(error);
        showToast('Subscription created successfully', 'success');
      }
      await fetchData('subscriptions');
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      user_name: '',
      user_email: '',
      bus_line_id: '',
      type: 'monthly',
      start_date: '',
      end_date: '',
      price: '',
      status: 'active',
    });
    setEditingSub(null);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setFormData({
      user_name: sub.user_name,
      user_email: sub.user_email,
      bus_line_id: String(sub.bus_line_id || ''),
      type: sub.type,
      start_date: normalizeDateForInput(sub.start_date),
      end_date: normalizeDateForInput(sub.end_date),
      price: sub.price.toString(),
      status: sub.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (sub: Subscription) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return;

    try {
      const subscriptionId = getSubscriptionId(sub);
      if (!subscriptionId) {
        throw new Error('Subscription ID missing, cannot delete');
      }
      const { error } = await api.from('subscriptions').delete().eq('id', subscriptionId);
      if (error) throw new Error(error);
      showToast('Subscription deleted successfully', 'success');
      await fetchData('subscriptions');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const columns = [
    { key: 'user_name', label: 'User', sortable: true },
    { key: 'user_email', label: 'Email', sortable: true },
    {
      key: 'bus_line',
      label: 'Bus Line',
      render: (sub: Subscription) =>
        sub.bus_line ? `${sub.bus_line.code} - ${sub.bus_line.name}` : '-',
    },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'start_date',
      label: 'Start Date',
      sortable: true,
      render: (sub: Subscription) => new Date(sub.start_date).toLocaleDateString(),
    },
    {
      key: 'end_date',
      label: 'End Date',
      sortable: true,
      render: (sub: Subscription) => new Date(sub.end_date).toLocaleDateString(),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (sub: Subscription) => `$${sub.price.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (sub: Subscription) => <StatusBadge status={sub.status} />,
    },
  ];

  const busLineOptions = [
    { value: '', label: 'Select a bus line' },
    ...busLines.map((line) => ({ value: getBusLineId(line), label: `${line.code} - ${line.name}` })),
  ];

  const typeOptions = SUBSCRIPTION_TYPES.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  const statusOptions = SUBSCRIPTION_STATUS.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  return (
    <PageLayout
      title="Subscriptions"
      description="Manage recurring subscriptions"
      actions={
        canCreate ? (
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5" />
          Add Subscription
        </Button>
        ) : undefined
      }
    >
      <Table
        data={subscriptions}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search subscriptions..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingSub ? 'Edit Subscription' : 'Add New Subscription'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="User Name"
            value={formData.user_name}
            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
            required
          />
          <FormInput
            label="User Email"
            type="email"
            value={formData.user_email}
            onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
            required
          />
          <FormSelect
            label="Bus Line"
            value={formData.bus_line_id}
            onChange={(e) => setFormData({ ...formData, bus_line_id: e.target.value })}
            options={busLineOptions}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SubscriptionType })}
              options={typeOptions}
              required
            />
            <FormInput
              label="Price ($)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as SubscriptionStatus })}
            options={statusOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {editingSub ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}