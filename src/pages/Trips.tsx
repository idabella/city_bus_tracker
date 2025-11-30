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
import { Bus, BusLine, Driver, Trip } from '../types';
import { usePermissions } from '../hooks/usePermissions';

type TripStatus = Trip['status'];

interface TripFormData {
  bus_line_id: string;
  bus_id: string;
  driver_id: string;
  departure_time: string;
  arrival_time: string;
  available_seats: string;
  price: string;
  status: TripStatus;
}

const TRIP_STATUS: TripStatus[] = ['scheduled', 'in_progress', 'completed', 'cancelled'];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getTripId = (trip: Trip | Record<string, unknown>) => {
  const source = trip as Record<string, unknown>;
  const rawId = source['id_trip'] || source['ID_TRIP'] || source['id'] || source['ID'];
  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
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

  if (rawId === undefined || rawId === null) return '';
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

const normalizeDateTimeForInput = (value?: string | null) => {
  if (!value) return '';

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 16);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 16);
  }

  return '';
};

const formatDateTimeForOracle = (value: string) => {
  if (!value) return '';

  if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const buildTripPayload = (data: TripFormData) => {
  const seats = Number(data.available_seats);
  const price = Number(data.price);
  const busLineId = Number(data.bus_line_id);
  const busId = Number(data.bus_id);
  const driverId = Number(data.driver_id);

  if (
    Number.isNaN(seats) ||
    Number.isNaN(price) ||
    Number.isNaN(busLineId) ||
    Number.isNaN(busId) ||
    Number.isNaN(driverId)
  ) {
    throw new Error('Please provide valid numeric values for seats, price, bus line, bus, and driver');
  }

  return {
    bus_line_id: busLineId,
    bus_id: busId,
    driver_id: driverId,
    departure_time: formatDateTimeForOracle(data.departure_time),
    arrival_time: formatDateTimeForOracle(data.arrival_time),
    available_seats: seats,
    price,
    status: data.status,
  };
};

export function Trips() {
  const { trips, busLines, buses, drivers, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('trips');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>({
    bus_line_id: '',
    bus_id: '',
    driver_id: '',
    departure_time: '',
    arrival_time: '',
    available_seats: '',
    price: '',
    status: 'scheduled',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = buildTripPayload(formData);

      if (editingTrip) {
        const tripId = getTripId(editingTrip);
        if (!tripId) {
          throw new Error('Trip ID missing, cannot update');
        }

        const { error } = await api
          .from('trips')
          .update(payload)
          .eq('id', tripId);
        if (error) throw new Error(error);
        showToast('Trip updated successfully', 'success');
      } else {
        const { error } = await api.from('trips').insert(payload);
        if (error) throw new Error(error);
        showToast('Trip created successfully', 'success');
      }
      await fetchData('trips');
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
      bus_line_id: '',
      bus_id: '',
      driver_id: '',
      departure_time: '',
      arrival_time: '',
      available_seats: '',
      price: '',
      status: 'scheduled',
    });
    setEditingTrip(null);
  };

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      bus_line_id: getBusLineId(trip.bus_line || { id: trip.bus_line_id || trip.bus_line?.id }),
      bus_id: getBusIdValue(trip.bus || { id: trip.bus_id }),
      driver_id: getDriverIdValue(trip.driver || { id: trip.driver_id }),
      departure_time: normalizeDateTimeForInput(trip.departure_time),
      arrival_time: normalizeDateTimeForInput(trip.arrival_time),
      available_seats: trip.available_seats.toString(),
      price: trip.price.toString(),
      status: trip.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (trip: Trip) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const tripId = getTripId(trip);
      if (!tripId) {
        throw new Error('Trip ID missing, cannot delete');
      }

      const { error } = await api.from('trips').delete().eq('id', tripId);
      if (error) throw new Error(error);
      showToast('Trip deleted successfully', 'success');
      await fetchData('trips');
    } catch (error: unknown) {
      showToast(getErrorMessage(error) || 'An error occurred', 'error');
    }
  };

  const columns = [
    {
      key: 'bus_line',
      label: 'Bus Line',
      render: (trip: Trip) => trip.bus_line?.code || trip.bus_line_id || '-',
    },
    {
      key: 'bus',
      label: 'Bus',
      render: (trip: Trip) => trip.bus?.plate_number || trip.bus_id || '-',
    },
    {
      key: 'route',
      label: 'Route',
      render: (trip: Trip) => {
        const origin = trip.bus_line?.origin_station?.name || trip.bus_line?.origin || '-';
        const destination = trip.bus_line?.destination_station?.name || trip.bus_line?.destination || '-';
        if (origin === '-' && destination === '-') return '-';
        return `${origin} → ${destination}`;
      },
    },
    {
      key: 'departure_time',
      label: 'Departure',
      sortable: true,
      render: (trip: Trip) => new Date(trip.departure_time).toLocaleString(),
    },
    {
      key: 'arrival_time',
      label: 'Arrival',
      sortable: true,
      render: (trip: Trip) => new Date(trip.arrival_time).toLocaleString(),
    },
    {
      key: 'driver_id',
      label: 'Driver',
      sortable: true,
      render: (trip: Trip) => trip.driver?.name || trip.driver_id || '-',
    },
    {
      key: 'available_seats',
      label: 'Available Seats',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (trip: Trip) => `$${trip.price.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (trip: Trip) => <StatusBadge status={trip.status} />,
    },
  ];

  const busLineOptions = [
    { value: '', label: 'Select a bus line' },
    ...busLines.map((line) => {
      const value = getBusLineId(line);
      const origin = line.origin_station?.name || line.origin || 'Unknown origin';
      const destination = line.destination_station?.name || line.destination || 'Unknown destination';
      return {
        value,
        label: `${line.code} - ${origin} → ${destination}`,
      };
    }),
  ];

  const busOptions = [
    { value: '', label: 'Select a bus' },
    ...buses.map((bus) => ({
      value: getBusIdValue(bus),
      label: `${bus.plate_number} (${bus.model})`,
    })),
  ];

  const driverOptions = [
    { value: '', label: 'Select a driver' },
    ...drivers.map((driver) => ({
      value: getDriverIdValue(driver),
      label: driver.name,
    })),
  ];

  const statusOptions = TRIP_STATUS.map((status) => ({
    value: status,
    label:
      status === 'in_progress'
        ? 'In Progress'
        : status.charAt(0).toUpperCase() + status.slice(1),
  }));

  return (
    <PageLayout
      title="Trips"
      description="Manage bus trips and schedules"
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
          Add Trip
        </Button>
        ) : undefined
      }
    >
      <Table
        data={trips}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search trips..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingTrip ? 'Edit Trip' : 'Add New Trip'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Bus Line"
            value={formData.bus_line_id}
            onChange={(e) => setFormData({ ...formData, bus_line_id: e.target.value })}
            options={busLineOptions}
            required
          />
          <FormSelect
            label="Bus"
            value={formData.bus_id}
            onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
            options={busOptions}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Departure Time"
              type="datetime-local"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
              required
            />
            <FormInput
              label="Arrival Time"
              type="datetime-local"
              value={formData.arrival_time}
              onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
              required
            />
          </div>
          <FormSelect
            label="Driver"
            value={formData.driver_id}
            onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
            options={driverOptions}
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Available Seats"
              type="number"
              value={formData.available_seats}
              onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })}
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
            <FormSelect
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as TripStatus })
              }
              options={statusOptions}
              required
            />
          </div>
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
              {editingTrip ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}