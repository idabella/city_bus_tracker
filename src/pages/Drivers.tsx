import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Table, StatusBadge } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormInput, FormSelect } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { api } from '../utils/api';
import { Driver } from '../types';

type DriverStatus = 'active' | 'inactive' | 'on_leave';

interface DriverFormData {
  name: string;
  email: string;
  phone: string;
  license_number: string;
  license_expiry: string;
  status: DriverStatus;
}

const DRIVER_STATUS: DriverStatus[] = ['active', 'inactive', 'on_leave'];

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
  if (!Number.isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return value;
};

const buildDriverPayload = (data: DriverFormData) => ({
  name: data.name.trim(),
  email: data.email.trim(),
  phone: data.phone.trim(),
  license_number: data.license_number.trim(),
  license_expiry: formatDateForOracle(data.license_expiry),
  status: data.status,
});

const getDriverId = (driver: Driver | Record<string, unknown>) => {
  const source = driver as Record<string, unknown>;
  const rawId =
    source['id_driver'] ||
    source['ID_DRIVER'] ||
    source['id'] ||
    source['ID'];

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export function Drivers() {
  const { drivers, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('drivers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = buildDriverPayload(formData);

      if (editingDriver) {
        const driverId = getDriverId(editingDriver);
        if (!driverId) {
          throw new Error('Driver ID missing, cannot update');
        }

        const { error } = await api.from('drivers').update(payload).eq('id', driverId);
        if (error) throw new Error(error);
        showToast('Driver updated successfully', 'success');
      } else {
        const { error } = await api.from('drivers').insert(payload);
        if (error) throw new Error(error);
        showToast('Driver created successfully', 'success');
      }
      await fetchData('drivers');
      setIsModalOpen(false);
      resetForm();
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      license_number: '',
      license_expiry: '',
      status: 'active',
    });
    setEditingDriver(null);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      license_number: driver.license_number,
      license_expiry: normalizeDateForInput(driver.license_expiry),
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm('Are you sure you want to delete this driver?')) return;

    try {
      const driverId = getDriverId(driver);
      if (!driverId) {
        throw new Error('Driver ID missing, cannot delete');
      }

      const { error } = await api.from('drivers').delete().eq('id', driverId);
      if (error) throw new Error(error);
      showToast('Driver deleted successfully', 'success');
      await fetchData('drivers');
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'An error occurred', 'error');
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'license_number', label: 'License', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (driver: Driver) => <StatusBadge status={driver.status} />,
    },
  ];

  const statusOptions = DRIVER_STATUS.map((status) => ({
    value: status,
    label:
      status === 'on_leave'
        ? 'On Leave'
        : status.charAt(0).toUpperCase() + status.slice(1),
  }));

  return (
    <PageLayout
      title="Drivers"
      description="Manage your driver workforce"
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
          Add Driver
        </Button>
        ) : undefined
      }
    >
      <Table
        data={drivers}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search drivers..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <FormInput
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="License Number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              required
            />
            <FormInput
              label="License Expiry"
              type="date"
              value={formData.license_expiry}
              onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
              required
            />
          </div>
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as DriverStatus })
            }
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
              {editingDriver ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}