// test.ts
import { oracle } from './oracle';

async function test() {
  console.log('🔍 Test connexion Oracle...\n');
  
  // Test connexion
  const result = await oracle.testConnection();
  
  if (result.success) {
    console.log('✅ Connexion OK!\n');
    
    // Test select
    const cities = await oracle.select('CITIES', '*');
    console.log('Nombre de villes:', cities.data?.length || 0);
    
  } else {
    console.log('❌ Erreur:', result.error);
  }
  
  process.exit(0);
}

test();