import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { Table } from '../components/Table';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { FormInput } from '../components/FormInput';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { Plus } from 'lucide-react';
import { City } from '../types';

const API_URL = 'http://localhost:3001/api';

export function Cities() {
  const { cities, fetchData } = useApp();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete } = usePermissions('cities');
  
  // ✅ DEBUG : Afficher les données reçues
  console.log('=== CITIES PAGE DEBUG ===');
  console.log('Cities data:', cities);
  console.log('Cities count:', cities.length);
  if (cities.length > 0) {
    console.log('First city:', cities[0]);
    console.log('First city keys:', Object.keys(cities[0]));
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    country: '', 
    region: '', 
    code_postal: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCity) {
        // ✅ UPDATE - Utilise ID_CITY au lieu de ID
        const response = await fetch(`${API_URL}/cities/${editingCity.id_city}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to update city');
        }
        
        showToast('City updated successfully', 'success');
      } else {
        // ✅ INSERT
        const response = await fetch(`${API_URL}/cities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to create city');
        }
        
        showToast('City created successfully', 'success');
      }
      
      // ✅ Rafraîchir les données
      await fetchData('cities');
      
      setIsModalOpen(false);
      setFormData({ name: '', country: '', region: '', code_postal: '' });
      setEditingCity(null);
    } catch (error: any) {
      console.error('Error:', error);
      showToast(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (city: City) => {
    // ✅ DEBUG : Voir la structure exacte
    console.log('=== EDIT DEBUG ===');
    console.log('City object:', city);
    console.log('city.id_city:', city.id_city);
    
    setEditingCity(city);
    setFormData({ 
      name: city.name, 
      country: city.country,
      region: city.region || '',
      code_postal: city.code_postal || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (city: City) => {
    // ✅ DEBUG : Voir la structure exacte de l'objet city
    console.log('=== DELETE DEBUG ===');
    console.log('City object:', city);
    console.log('city.id_city:', city.id_city);
    console.log('All keys:', Object.keys(city));
    
    if (!confirm('Are you sure you want to delete this city?')) return;

    // ✅ Trouve le bon champ ID (essaie plusieurs possibilités)
    const cityId = city.id_city || city.ID_CITY || (city as any).id || (city as any).ID;
    
    console.log('Using ID:', cityId);
    
    if (!cityId) {
      showToast('Cannot delete: City ID not found', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cities/${cityId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Failed to delete city');
      }
      
      showToast('City deleted successfully', 'success');
      
      // ✅ Rafraîchir les données
      await fetchData('cities');
    } catch (error: any) {
      console.error('Error:', error);
      showToast(error.message || 'An error occurred', 'error');
    }
  };

  // ✅ Colonnes corrigées pour correspondre aux données Oracle
  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'code_postal', label: 'Code Postal', sortable: true },
    { key: 'country', label: 'Country', sortable: true },
  ];

  return (
    <PageLayout
      title="Cities"
      description="Manage cities in your bus network"
      actions={
        canCreate
          ? (
        <Button
          variant="primary"
          onClick={() => {
            setEditingCity(null);
            setFormData({ name: '', country: '', region: '', code_postal: '' });
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5" />
          Add City
        </Button>
          )
          : undefined
      }
    >
      <Table
        data={cities}
        columns={columns}
        onEdit={canUpdate ? handleEdit : undefined}
        onDelete={canDelete ? handleDelete : undefined}
        searchPlaceholder="Search cities..."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCity(null);
          setFormData({ name: '', country: '', region: '', code_postal: '' });
        }}
        title={editingCity ? 'Edit City' : 'Add New City'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="City Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <FormInput
            label="Region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            required
          />
          <FormInput
            label="Code Postal"
            value={formData.code_postal}
            onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
            required
          />
          <FormInput
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCity(null);
                setFormData({ name: '', country: '', region: '', code_postal: '' });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={loading}>
              {editingCity ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}