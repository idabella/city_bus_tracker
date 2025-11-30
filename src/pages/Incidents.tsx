import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Table, StatusBadge } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormInput, FormSelect, FormTextarea } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { Plus } from 'lucide-react';
import { api } from '../utils/api';
import { Incident, Bus, Trip, Driver } from '../types';
import { usePermissions } from '../hooks/usePermissions';

const getIncidentId = (item: Incident | Record<string, unknown>) => {
  const source = item as Record<string, unknown>;
  const rawId =
    source['id_incident'] ||
    source['ID_INCIDENT'] ||
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

const getTripIdValue = (trip: Trip | Record<string, unknown>) => {
  const source = trip as Record<string, unknown>;
  const rawId =
    source['id_trip'] ||
    source['ID_TRIP'] ||
    source['id'] ||
    source['ID'];

  if (rawId === undefined || rawId === null) return '';
  return String(rawId);
};

const getDriverIdValue = (driver: Driver | Record<string, unknown> | null | undefined) => {
  if (!driver) return '';
  const source = driver as Record<string, unknown>;
  const rawId =
    source['id_driver'] ||
    source['ID_DRIVER'] ||
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

export function Incidents() {
  const { incidents, trips, buses, drivers, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('incidents');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [formData, setFormData] = useState({
    trip_id: '',
    bus_id: '',
    driver_id: '',
    type: 'delay',
    description: '',
    severity: 'low',
    incident_date: '',
    resolved_date: '',
    status: 'open',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate bus selection (required)
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

      // Convert trip_id to number (optional)
      let tripId: number | null = null;
      if (formData.trip_id && formData.trip_id.trim() !== '') {
        const tripIdStr = formData.trip_id.trim();
        if (/^[0-9A-Fa-f]+$/.test(tripIdStr) && tripIdStr.length > 2) {
          tripId = parseInt(tripIdStr, 16);
          if (Number.isNaN(tripId)) {
            throw new Error('Invalid trip ID format');
          }
        } else {
          tripId = Number(tripIdStr);
          if (Number.isNaN(tripId) || tripId <= 0) {
            throw new Error('Trip ID must be a valid number');
          }
        }
      }

      // Convert driver_id to number (optional)
      let driverId: number | null = null;
      if (formData.driver_id && formData.driver_id.trim() !== '') {
        const driverIdStr = formData.driver_id.trim();
        if (/^[0-9A-Fa-f]+$/.test(driverIdStr) && driverIdStr.length > 2) {
          driverId = parseInt(driverIdStr, 16);
          if (Number.isNaN(driverId)) {
            throw new Error('Invalid driver ID format');
          }
        } else {
          driverId = Number(driverIdStr);
          if (Number.isNaN(driverId) || driverId <= 0) {
            throw new Error('Driver ID must be a valid number');
          }
        }
      }

      const payload = {
        bus_id: busId, // Number for Oracle NUMBER column
        trip_id: tripId, // Number or null
        driver_id: driverId, // Number or null
        type: formData.type,
        description: formData.description.trim() || '',
        severity: formData.severity,
        incident_date: formatDateForOracle(formData.incident_date),
        resolved_date: formData.resolved_date ? formatDateForOracle(formData.resolved_date) : null,
        status: formData.status,
      };

      if (editingIncident) {
        const incidentId = getIncidentId(editingIncident);
        if (!incidentId) {
          throw new Error('Incident ID missing, cannot update');
        }
        const { error } = await api
          .from('incidents')
          .update(payload)
          .eq('id', incidentId);
        if (error) throw new Error(error);
        showToast('Incident updated successfully', 'success');
      } else {
        const { error } = await api.from('incidents').insert(payload);
        if (error) throw new Error(error);
        showToast('Incident reported successfully', 'success');
      }
      await fetchData('incidents');
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
      trip_id: '',
      bus_id: '',
      driver_id: '',
      type: 'delay',
      description: '',
      severity: 'low',
      incident_date: '',
      resolved_date: '',
      status: 'open',
    });
    setEditingIncident(null);
  };

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident);
    setFormData({
      trip_id: String(incident.trip_id || ''),
      bus_id: String(incident.bus_id || ''),
      driver_id: String(incident.driver_id || ''),
      type: incident.type,
      description: incident.description || '',
      severity: incident.severity,
      incident_date: normalizeDateForInput(incident.incident_date),
      resolved_date: normalizeDateForInput(incident.resolved_date),
      status: incident.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (incident: Incident) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const incidentId = getIncidentId(incident);
      if (!incidentId) {
        throw new Error('Incident ID missing, cannot delete');
      }
      const { error } = await api.from('incidents').delete().eq('id', incidentId);
      if (error) throw new Error(error);
      showToast('Incident deleted successfully', 'success');
      await fetchData('incidents');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const columns = [
    { key: 'type', label: 'Type', sortable: true },
    {
      key: 'bus',
      label: 'Bus',
      render: (incident: Incident) => {
        try {
          if (incident.bus) {
            return incident.bus.plate_number || '-';
          }
          // Fallback: try to find bus by ID
          const busId = incident.bus_id || incident.BUS_ID;
          if (busId && buses.length > 0) {
            const bus = buses.find(b => {
              const bId = getBusIdValue(b);
              return String(bId) === String(busId);
            });
            if (bus) {
              return bus.plate_number || '-';
            }
          }
          return '-';
        } catch (error) {
          console.error('Error rendering bus:', error, incident);
          return '-';
        }
      },
    },
    {
      key: 'description',
      label: 'Description',
      render: (incident: Incident) => {
        try {
          let desc = incident.description || incident.DESCRIPTION;
          if (desc === null || desc === undefined) desc = '-';
          if (typeof desc !== 'string') desc = String(desc);
          if (!desc || desc.trim() === '') desc = '-';
          return <div className="max-w-md whitespace-normal break-words">{desc}</div>;
        } catch (error) {
          console.error('Error rendering description:', error, incident);
          return <div className="max-w-md whitespace-normal break-words">-</div>;
        }
      },
    },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (incident: Incident) => {
        try {
          return <StatusBadge status={incident.severity} type="severity" />;
        } catch (error) {
          console.error('Error rendering severity:', error, incident);
          return '-';
        }
      },
    },
    {
      key: 'incident_date',
      label: 'Date',
      sortable: true,
      render: (incident: Incident) => {
        try {
          if (!incident.incident_date) return '-';
          const date = new Date(incident.incident_date);
          if (Number.isNaN(date.getTime())) return '-';
          return date.toLocaleDateString();
        } catch (error) {
          console.error('Error rendering incident_date:', error, incident);
          return '-';
        }
      },
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (incident: Incident) => {
        try {
          return <StatusBadge status={incident.status} />;
        } catch (error) {
          console.error('Error rendering status:', error, incident);
          return '-';
        }
      },
    },
  ];

  const tripOptions = [
    { value: '', label: 'None (Optional)' },
    ...trips.map((trip) => ({
      value: getTripIdValue(trip),
      label: `${trip.bus_line?.code || 'Trip'} - ${new Date(trip.departure_time).toLocaleDateString()}`,
    })),
  ];

  const busOptions = [
    { value: '', label: 'Select a bus' },
    ...buses.map((bus) => ({ value: getBusIdValue(bus), label: `${bus.plate_number} (${bus.model})` })),
  ];

  const driverOptions = [
    { value: '', label: 'None (Optional)' },
    ...drivers.map((driver) => ({ value: getDriverIdValue(driver), label: driver.name })),
  ];

  const typeOptions = [
    { value: 'accident', label: 'Accident' },
    { value: 'breakdown', label: 'Breakdown' },
    { value: 'delay', label: 'Delay' },
    { value: 'other', label: 'Other' },
  ];

  const severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'investigating', label: 'Investigating' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <PageLayout
      title="Incidents"
      description="Manage and track incidents"
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
          Report Incident
        </Button>
        ) : undefined
      }
    >
      <Table
        data={incidents}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search incidents..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingIncident ? 'Edit Incident' : 'Report New Incident'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={typeOptions}
              required
            />
            <FormSelect
              label="Severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              options={severityOptions}
              required
            />
          </div>
          <FormSelect
            label="Bus"
            value={formData.bus_id}
            onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
            options={busOptions}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Trip"
              value={formData.trip_id}
              onChange={(e) => setFormData({ ...formData, trip_id: e.target.value })}
              options={tripOptions}
            />
            <FormSelect
              label="Driver"
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              options={driverOptions}
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
              label="Incident Date"
              type="date"
              value={formData.incident_date}
              onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
              required
            />
            <FormInput
              label="Resolved Date"
              type="date"
              value={formData.resolved_date}
              onChange={(e) => setFormData({ ...formData, resolved_date: e.target.value })}
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
              {editingIncident ? 'Update' : 'Report'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}