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
import { Ticket, Trip, Station } from '../types';
import { usePermissions } from '../hooks/usePermissions';

type TicketStatus = Ticket['status'];

interface TicketFormData {
  trip_id: string;
  start_station: string;
  end_station: string;
  seat_number: string;
  price: string;
  status: TicketStatus;
  booking_date: string;
}

const TICKET_STATUS: TicketStatus[] = ['booked', 'confirmed', 'cancelled', 'used'];

const getTicketId = (ticket: Ticket | Record<string, unknown>) => {
  const source = ticket as Record<string, unknown>;
  const rawId =
    source['id_ticket'] ||
    source['ID_TICKET'] ||
    source['id'] ||
    source['ID'];

  if (rawId === undefined || rawId === null) return null;
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

const getTodayLocalISODate = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().split('T')[0];
};

const normalizeDateForInput = (value?: string | null) => {
  if (!value) return getTodayLocalISODate();

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return getTodayLocalISODate();
};

const stationOptionLabel = (station: Station) => {
  const city = station.city?.name ? ` - ${station.city.name}` : '';
  return `${station.name}${city}`;
};

export function Tickets() {
  const { tickets, trips, stations, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('tickets');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<TicketFormData>({
    trip_id: '',
    start_station: '',
    end_station: '',
    seat_number: '',
    price: '',
    status: 'booked',
    booking_date: getTodayLocalISODate(),
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceValue = Number(formData.price);
      const tripId = Number(formData.trip_id);

      if (Number.isNaN(priceValue) || Number.isNaN(tripId)) {
        throw new Error('Trip and price must be numeric');
      }

      const bookingDate = formData.booking_date || getTodayLocalISODate();

      const payload = {
        trip_id: tripId,
        passenger_name: formData.start_station.trim(),
        passenger_email: formData.end_station.trim(),
        passenger_phone: 'N/A',
        seat_number: formData.seat_number.trim(),
        price: priceValue,
        status: formData.status,
        booking_date: bookingDate,
      };

      if (editingTicket) {
        const ticketId = getTicketId(editingTicket);
        if (!ticketId) {
          throw new Error('Ticket ID missing, cannot update');
        }
        const { error } = await api.from('tickets').update(payload).eq('id', ticketId);
        if (error) throw new Error(error);
        showToast('Ticket updated successfully', 'success');
      } else {
        const { error } = await api.from('tickets').insert(payload);
        if (error) throw new Error(error);
        showToast('Ticket booked successfully', 'success');
      }
      await fetchData('tickets');
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
      start_station: '',
      end_station: '',
      seat_number: '',
      price: '',
      status: 'booked',
      booking_date: getTodayLocalISODate(),
    });
    setEditingTicket(null);
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setFormData({
      trip_id: ticket.trip_id,
      start_station: ticket.passenger_name || (ticket as any).station_montee || '',
      end_station: ticket.passenger_email || (ticket as any).station_descente || '',
      seat_number: ticket.seat_number,
      price: ticket.price.toString(),
      status: ticket.status,
      booking_date: normalizeDateForInput(ticket.booking_date),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (ticket: Ticket) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      const ticketId = getTicketId(ticket);
      if (!ticketId) {
        throw new Error('Ticket ID missing, cannot delete');
      }

      const { error } = await api.from('tickets').delete().eq('id', ticketId);
      if (error) throw new Error(error);
      showToast('Ticket deleted successfully', 'success');
      await fetchData('tickets');
    } catch (error: any) {
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  const columns = [
    {
      key: 'trip',
      label: 'Trip',
      render: (ticket: Ticket) =>
        ticket.trip?.bus_line
          ? `${ticket.trip.bus_line.code} - ${new Date(ticket.trip.departure_time).toLocaleDateString()}`
          : ticket.trip_id,
    },
    {
      key: 'start_station',
      label: 'Start Station',
      sortable: true,
      render: (ticket: Ticket) =>
        ticket.passenger_name || (ticket as any).station_montee || '-',
    },
    {
      key: 'end_station',
      label: 'End Station',
      sortable: true,
      render: (ticket: Ticket) =>
        ticket.passenger_email || (ticket as any).station_descente || '-',
    },
    { key: 'seat_number', label: 'Seat', sortable: true },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (ticket: Ticket) => `$${ticket.price.toFixed(2)}`,
    },
    {
      key: 'booking_date',
      label: 'Booking Date',
      sortable: true,
      render: (ticket: Ticket) => new Date(ticket.booking_date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (ticket: Ticket) => <StatusBadge status={ticket.status} />,
    },
  ];

  const tripOptions = [
    { value: '', label: 'Select a trip' },
    ...trips.map((trip) => ({
      value: getTripIdValue(trip),
      label: `${trip.bus_line?.code || 'Trip'} - ${new Date(trip.departure_time).toLocaleString()}`,
    })),
  ];

  const stationOptions = [
    { value: '', label: 'Select station' },
    ...stations.map((station) => ({
      value: station.name,
      label: stationOptionLabel(station),
    })),
  ];

  const statusOptions = TICKET_STATUS.map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  }));

  return (
    <PageLayout
      title="Tickets"
      description="Manage ticket bookings"
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
          Book Ticket
        </Button>
        ) : undefined
      }
    >
      <Table
        data={tickets}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search tickets..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingTicket ? 'Edit Ticket' : 'Book New Ticket'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormSelect
            label="Trip"
            value={formData.trip_id}
            onChange={(e) => setFormData({ ...formData, trip_id: e.target.value })}
            options={tripOptions}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              label="Start Station"
              value={formData.start_station}
              onChange={(e) => setFormData({ ...formData, start_station: e.target.value })}
              options={stationOptions}
              required
            />
            <FormSelect
              label="End Station"
              value={formData.end_station}
              onChange={(e) => setFormData({ ...formData, end_station: e.target.value })}
              options={stationOptions}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormInput
              label="Seat Number"
              value={formData.seat_number}
              onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
              placeholder="e.g., A1"
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
            <FormInput
              label="Booking Date"
              type="date"
              value={formData.booking_date}
              onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
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
              {editingTicket ? 'Update' : 'Book'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}