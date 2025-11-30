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
import { BusLine, Station } from '../types';

const API_URL = 'http://localhost:3001/api';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

type BufferLike = { type: 'Buffer'; data: number[] };

const isBufferLike = (value: unknown): value is BufferLike =>
  typeof value === 'object' &&
  value !== null &&
  (value as BufferLike).type === 'Buffer' &&
  Array.isArray((value as BufferLike).data);

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

const getStationId = (station: Station | Record<string, unknown>) => {
  const source = station as Record<string, unknown>;
  const rawId =
    source['id_station'] ||
    source['ID_STATION'] ||
    source['id'] ||
    source['ID'];

  return rawId ? String(rawId) : '';
};

const toHexFromBufferObject = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (isBufferLike(value)) {
    return value.data.map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  if (isNumberArray(value)) {
    return value.map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  }

  if (typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    const fromKeys = candidate['id'] || candidate['ID'];
    return fromKeys ? String(fromKeys) : null;
  }

  return null;
};

const getBusLineId = (line: BusLine | Record<string, unknown>) => {
  const source = line as Record<string, unknown>;
  const rawId =
    source['id_line'] ||
    source['ID_LINE'] ||
    source['id_bus_line'] ||
    source['ID_BUS_LINE'] ||
    source['id'] ||
    source['ID'];

  return toHexFromBufferObject(rawId);
};

export function BusLines() {
  const { busLines, stations, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('busLines');
  
  // ✅ DEBUG : Afficher les données reçues
  console.log('=== BUS LINES PAGE DEBUG ===');
  console.log('Bus Lines data:', busLines);
  console.log('Bus Lines count:', busLines.length);
  console.log('Stations data:', stations);
  if (busLines.length > 0) {
    console.log('First bus line:', busLines[0]);
    console.log('First bus line keys:', Object.keys(busLines[0]));
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusLine, setEditingBusLine] = useState<BusLine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    origin_station_id: '',
    destination_station_id: '',
    distance_km: '',
    duration_minutes: '',
    status: 'active',
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
        name: formData.name,
        code: formData.code,
        origin_station_id: formData.origin_station_id,
        destination_station_id: formData.destination_station_id,
        distance_km: parseFloat(formData.distance_km),
        duration_minutes: parseInt(formData.duration_minutes),
        status: formData.status,
      };
      
      console.log('Payload to send:', payload);

      if (editingBusLine) {
        // ✅ UPDATE
        const busLineId = getBusLineId(editingBusLine);
        
        if (!busLineId) {
          throw new Error('Bus line ID missing, cannot update');
        }

        const response = await fetch(`${API_URL}/bus_lines/${busLineId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to update bus line');
        }
        
        showToast('Bus line updated successfully', 'success');
      } else {
        // ✅ INSERT
        const response = await fetch(`${API_URL}/bus_lines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to create bus line');
        }
        
        showToast('Bus line created successfully', 'success');
      }
      
      // ✅ Rafraîchir les données
      await fetchData('busLines');
      
      setIsModalOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error('Error:', error);
      showToast(getErrorMessage(error) || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      origin_station_id: '',
      destination_station_id: '',
      distance_km: '',
      duration_minutes: '',
      status: 'active',
    });
    setEditingBusLine(null);
  };

  const handleEdit = (busLine: BusLine) => {
    // ✅ DEBUG : Voir la structure exacte
    console.log('=== EDIT DEBUG ===');
    console.log('Bus Line object:', busLine);
    
    setEditingBusLine(busLine);
    setFormData({
      name: busLine.name,
      code: busLine.code,
      origin_station_id: String(busLine.origin_station_id),
      destination_station_id: String(busLine.destination_station_id),
      distance_km: busLine.distance_km.toString(),
      duration_minutes: busLine.duration_minutes.toString(),
      status: busLine.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (busLine: BusLine) => {
    // ✅ DEBUG : Voir la structure exacte
    console.log('=== DELETE DEBUG ===');
    console.log('Bus Line object:', busLine);
    
    if (!confirm('Are you sure you want to delete this bus line?')) return;

    // ✅ Trouve le bon champ ID
    const busLineId = getBusLineId(busLine);
    
    console.log('Using ID:', busLineId);
    
    if (!busLineId) {
      showToast('Cannot delete: Bus Line ID not found', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/bus_lines/${busLineId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to delete bus line');
      }
      
      showToast('Bus line deleted successfully', 'success');
      
      // ✅ Rafraîchir les données
      await fetchData('busLines');
    } catch (error: unknown) {
      console.error('Error:', error);
      showToast(getErrorMessage(error) || 'An error occurred', 'error');
    }
  };

  const columns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'origin',
      label: 'Origin',
      render: (line: BusLine) => line.origin_station?.name || '-',
    },
    {
      key: 'destination',
      label: 'Destination',
      render: (line: BusLine) => line.destination_station?.name || '-',
    },
    {
      key: 'distance_km',
      label: 'Distance (km)',
      sortable: true,
      render: (line: BusLine) => `${line.distance_km} km`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (line: BusLine) => <StatusBadge status={line.status} />,
    },
  ];

  // ✅ Utilise les bons IDs pour les stations
  const stationOptions = [
    { value: '', label: 'Select a station' },
    ...stations.map((station) => {
      const stationId = getStationId(station);
      return {
        value: stationId,
        label: `${station.name} (${station.city?.name || 'Unknown'})`,
      };
    }),
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <PageLayout
      title="Bus Lines"
      description="Manage routes and bus lines"
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
          Add Bus Line
        </Button>
        ) : undefined
      }
    >
      <Table
        data={busLines}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search bus lines..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingBusLine ? 'Edit Bus Line' : 'Add New Bus Line'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Line Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g., L101"
              required
            />
            <FormInput
              label="Line Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <FormSelect
            label="Origin Station"
            value={formData.origin_station_id}
            onChange={(e) => setFormData({ ...formData, origin_station_id: e.target.value })}
            options={stationOptions}
            required
          />
          <FormSelect
            label="Destination Station"
            value={formData.destination_station_id}
            onChange={(e) =>
              setFormData({ ...formData, destination_station_id: e.target.value })
            }
            options={stationOptions}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Distance (km)"
              type="number"
              step="0.1"
              value={formData.distance_km}
              onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
              required
            />
            <FormInput
              label="Duration (minutes)"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
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
              {editingBusLine ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}