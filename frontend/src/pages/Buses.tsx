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
import { Bus } from '../types';

const API_URL = 'http://localhost:3001/api';

export function Buses() {
  const { buses, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('buses');
  
  // ✅ DEBUG : Afficher les données reçues
  console.log('=== BUSES PAGE DEBUG ===');
  console.log('Buses data:', buses);
  console.log('Buses count:', buses.length);
  if (buses.length > 0) {
    console.log('First bus:', buses[0]);
    console.log('First bus keys:', Object.keys(buses[0]));
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    capacity: '',
    year: '',
    status: 'available',
    last_maintenance_date: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ DEBUG : Voir ce qui est envoyé
      console.log('=== SUBMIT DEBUG ===');
      console.log('formData:', formData);
      
      const payload = {
        plate_number: formData.plate_number,
        model: formData.model,
        capacity: parseInt(formData.capacity),
        year: parseInt(formData.year),
        status: formData.status,
        last_maintenance_date: formData.last_maintenance_date || null,
      };
      
      console.log('Payload to send:', payload);

      if (editingBus) {
        // ✅ UPDATE
        const busId = editingBus.id_bus || editingBus.ID_BUS || editingBus.id;
        
        const response = await fetch(`${API_URL}/buses/${busId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to update bus');
        }
        
        showToast('Bus updated successfully', 'success');
      } else {
        // ✅ INSERT
        const response = await fetch(`${API_URL}/buses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to create bus');
        }
        
        showToast('Bus created successfully', 'success');
      }
      
      // ✅ Rafraîchir les données
      await fetchData('buses');
      
      setIsModalOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error:', error);
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      plate_number: '',
      model: '',
      capacity: '',
      year: '',
      status: 'available',
      last_maintenance_date: '',
    });
    setEditingBus(null);
  };

  const handleEdit = (bus: Bus) => {
    // ✅ DEBUG : Voir la structure exacte
    console.log('=== EDIT DEBUG ===');
    console.log('Bus object:', bus);
    
    setEditingBus(bus);
    setFormData({
      plate_number: bus.plate_number,
      model: bus.model,
      capacity: bus.capacity.toString(),
      year: bus.year.toString(),
      status: bus.status,
      last_maintenance_date: bus.last_maintenance_date || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (bus: Bus) => {
    // ✅ DEBUG : Voir la structure exacte
    console.log('=== DELETE DEBUG ===');
    console.log('Bus object:', bus);
    
    if (!confirm('Are you sure you want to delete this bus?')) return;

    // ✅ Trouve le bon champ ID
    const busId = bus.id_bus || bus.ID_BUS || bus.id;
    
    console.log('Using ID:', busId);
    
    if (!busId) {
      showToast('Cannot delete: Bus ID not found', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/buses/${busId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to delete bus');
      }
      
      showToast('Bus deleted successfully', 'success');
      
      // ✅ Rafraîchir les données
      await fetchData('buses');
    } catch (error: any) {
      console.error('Error:', error);
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const columns = [
    { key: 'plate_number', label: 'Plate Number', sortable: true },
    { key: 'model', label: 'Model', sortable: true },
    { key: 'capacity', label: 'Capacity', sortable: true },
    { key: 'year', label: 'Year', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (bus: Bus) => <StatusBadge status={bus.status} />,
    },
  ];

  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'in_service', label: 'In Service' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
  ];

  return (
    <PageLayout
      title="Buses"
      description="Manage your bus fleet"
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
          Add Bus
        </Button>
        ) : undefined
      }
    >
      <Table
        data={buses}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search buses..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingBus ? 'Edit Bus' : 'Add New Bus'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Plate Number"
              value={formData.plate_number}
              onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
              placeholder="e.g., ABC-123"
              required
            />
            <FormInput
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g., Mercedes-Benz Citaro"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="Number of seats"
              required
            />
            <FormInput
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="e.g., 2023"
              required
            />
          </div>
          <FormSelect
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statusOptions}
            required
          />
          <FormInput
            label="Last Maintenance Date"
            type="date"
            value={formData.last_maintenance_date}
            onChange={(e) =>
              setFormData({ ...formData, last_maintenance_date: e.target.value })
            }
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
              {editingBus ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}