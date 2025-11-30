import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Table, StatusBadge } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormInput, FormSelect, FormTextarea } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { api } from '../utils/api';
import { Maintenance, Bus } from '../types';

const getMaintenanceId = (item: Maintenance | Record<string, unknown>) => {
  const source = item as Record<string, unknown>;
  const rawId =
    source['id_maintenance'] ||
    source['ID_MAINTENANCE'] ||
    source['id'] ||
    source['ID'];

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const getBusIdValue = (bus: Bus | Record<string, unknown> | null | undefined) => {
  if (!bus) return '';
  const source = bus as Record<string, unknown>;
  const rawId =
    source['id_bus'] ||
    source['ID_BUS'] ||
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

export function MaintenancePage() {
  const { maintenance, buses, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('maintenance');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [formData, setFormData] = useState({
    bus_id: '',
    type: 'routine',
    description: '',
    scheduled_date: '',
    completed_date: '',
    cost: '',
    status: 'scheduled',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate bus selection
      if (!formData.bus_id || formData.bus_id.trim() === '') {
        throw new Error('Please select a bus');
      }

      // Validate that the selected bus exists
      const busIdStr = formData.bus_id.trim();
      const selectedBus = buses.find((bus) => getBusIdValue(bus) === busIdStr);
      if (!selectedBus) {
        throw new Error('Please select a valid bus');
      }

      // Convert bus_id to number for Oracle (handle hex strings)
      let busId: number;
      if (/^[0-9A-Fa-f]+$/.test(busIdStr) && busIdStr.length > 2) {
        // Hex string - convert to number
        busId = parseInt(busIdStr, 16);
        if (Number.isNaN(busId)) {
          throw new Error('Invalid bus ID format');
        }
      } else {
        // Regular number string
        busId = Number(busIdStr);
        if (Number.isNaN(busId) || busId <= 0) {
          throw new Error('Bus ID must be a valid number');
        }
      }

      // Validate description
      if (!formData.description || formData.description.trim() === '') {
        throw new Error('Description is required');
      }

      // Validate cost
      if (!formData.cost || formData.cost.trim() === '') {
        throw new Error('Cost is required');
      }

      const costValue = Number(formData.cost);
      if (Number.isNaN(costValue) || costValue < 0) {
        throw new Error('Cost must be a valid positive number');
      }

      const payload = {
        bus_id: busId, // Number for Oracle NUMBER column
        type: formData.type,
        description: formData.description.trim() || '', // Ensure description is never null/undefined
        scheduled_date: formatDateForOracle(formData.scheduled_date),
        completed_date: formData.completed_date ? formatDateForOracle(formData.completed_date) : null,
        cost: costValue,
        status: formData.status,
      };

      if (editingMaintenance) {
        const maintenanceId = getMaintenanceId(editingMaintenance);
        if (!maintenanceId) {
          throw new Error('Maintenance ID missing, cannot update');
        }
        const { error } = await api
          .from('maintenance')
          .update(payload)
          .eq('id', maintenanceId);
        if (error) throw new Error(error);
        showToast('Maintenance record updated successfully', 'success');
      } else {
        const { error } = await api.from('maintenance').insert(payload);
        if (error) throw new Error(error);
        showToast('Maintenance record created successfully', 'success');
      }
      await fetchData('maintenance');
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
      bus_id: '',
      type: 'routine',
      description: '',
      scheduled_date: '',
      completed_date: '',
      cost: '',
      status: 'scheduled',
    });
    setEditingMaintenance(null);
  };

  const handleEdit = (item: Maintenance) => {
    setEditingMaintenance(item);
    setFormData({
      bus_id: String(item.bus_id || ''),
      type: item.type,
      description: item.description,
      scheduled_date: normalizeDateForInput(item.scheduled_date),
      completed_date: normalizeDateForInput(item.completed_date),
      cost: item.cost.toString(),
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: Maintenance) => {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;

    try {
      const maintenanceId = getMaintenanceId(item);
      if (!maintenanceId) {
        throw new Error('Maintenance ID missing, cannot delete');
      }
      const { error } = await api.from('maintenance').delete().eq('id', maintenanceId);
      if (error) throw new Error(error);
      showToast('Maintenance record deleted successfully', 'success');
      await fetchData('maintenance');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const columns = [
    {
      key: 'bus',
      label: 'Bus',
      render: (item: Maintenance) => {
        try {
          if (item.bus) {
            const plate = item.bus.plate_number || '-';
            const model = item.bus.model || '';
            return model ? `${plate} (${model})` : plate;
          }
          // Fallback: try to find bus by ID
          const busId = item.bus_id || item.BUS_ID;
          if (busId && buses.length > 0) {
            const bus = buses.find(b => {
              const bId = getBusIdValue(b);
              return String(bId) === String(busId);
            });
            if (bus) {
              const plate = bus.plate_number || '-';
              const model = bus.model || '';
              return model ? `${plate} (${model})` : plate;
            }
          }
          return '-';
        } catch (error) {
          console.error('Error rendering bus:', error, item);
          return '-';
        }
      },
    },
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'description',
      label: 'Description',
      render: (item: Maintenance) => {
        try {
          let desc = item.description || item.DESCRIPTION;
          
          // Handle null/undefined
          if (desc === null || desc === undefined) {
            desc = '-';
          }
          
          // Convert to string if it's not already
          if (typeof desc !== 'string') {
            desc = String(desc);
          }
          
          // Ensure we have a valid string
          if (!desc || desc.trim() === '') {
            desc = '-';
          }
          
          return <div className="max-w-md whitespace-normal break-words">{desc}</div>;
        } catch (error) {
          console.error('Error rendering description:', error, item);
          return <div className="max-w-md whitespace-normal break-words">-</div>;
        }
      },
    },
    {
      key: 'scheduled_date',
      label: 'Scheduled',
      sortable: true,
      render: (item: Maintenance) => {
        try {
          if (!item.scheduled_date) return '-';
          const date = new Date(item.scheduled_date);
          if (Number.isNaN(date.getTime())) return '-';
          return date.toLocaleDateString();
        } catch (error) {
          console.error('Error rendering scheduled_date:', error, item);
          return '-';
        }
      },
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (item: Maintenance) => {
        try {
          const cost = item.cost;
          if (cost === null || cost === undefined || Number.isNaN(cost)) return '-';
          return `$${Number(cost).toFixed(2)}`;
        } catch (error) {
          console.error('Error rendering cost:', error, item);
          return '-';
        }
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: Maintenance) => <StatusBadge status={item.status} />,
    },
  ];

  const busOptions = [
    { value: '', label: 'Select a bus' },
    ...buses.map((bus) => ({ value: getBusIdValue(bus), label: `${bus.plate_number} (${bus.model})` })),
  ];

  const typeOptions = [
    { value: 'routine', label: 'Routine' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
  ];

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <PageLayout
      title="Maintenance"
      description="Manage bus maintenance records"
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
          Add Maintenance
        </Button>
        ) : undefined
      }
    >
      <Table
        data={maintenance}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search maintenance records..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingMaintenance ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Bus"
            value={formData.bus_id}
            onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
            options={busOptions}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={typeOptions}
              required
            />
            <FormInput
              label="Cost ($)"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              required
            />
          </div>
          <FormTextarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Scheduled Date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
            />
            <FormInput
              label="Completed Date"
              type="date"
              value={formData.completed_date}
              onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
            />
          </div>
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
              {editingMaintenance ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}