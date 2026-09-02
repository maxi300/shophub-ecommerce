// components/checkout-address-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

// Base de datos de departamentos, municipios y códigos postales de El Salvador (Actualizada con todos los municipios de Morazán incluyendo Sociedad)
const svLocations: Record<string, { municipalities: string[]; postalCode: string }> = {
  'San Salvador': {
    municipalities: [
      'San Salvador Centro', 'San Salvador Sur', 'San Salvador Este', 'San Salvador Oeste', 
      'San Salvador Norte', 'Aguilares', 'El Paisnal', 'Guazapa', 'Tonacatepeque'
    ],
    postalCode: '1101'
  },
  'La Libertad': {
    municipalities: [
      'La Libertad Este', 'La Libertad Oeste', 'La Libertad Costa', 'La Libertad Centro', 
      'La Libertad Sur', 'La Libertad Norte', 'San Juan Opico', 'Quezaltepeque'
    ],
    postalCode: '1501'
  },
  'San Miguel': {
    municipalities: [
      'San Miguel Centro', 'San Miguel Este', 'San Miguel Norte', 'Chinameca', 
      'El Tránsito', 'Quelepa', 'San Rafael Oriente', 'Comacarán', 'Uluazapa'
    ],
    postalCode: '3301'
  },
  'Morazán': {
    municipalities: [
      'San Francisco Gotera', 'Arambala', 'Cacaopera', 'Chilanga', 'Corinto', 
      'Delicias de Concepción', 'El Divisadero', 'El Rosario', 'Gualococti', 
      'Guatajiagua', 'Jocoro', 'Lolotiquillo', 'Meanguera', 'Osicala', 'Perquín', 
      'San Carlos', 'San Fernando', 'San Isidro', 'San Simón', 'Sensembra', 
      'Sociedad', 'Torola', 'Yamabal', 'Yoloaiquín'
    ],
    postalCode: '03101'
  },
  'Santa Ana': {
    municipalities: ['Santa Ana Centro', 'Santa Ana Este', 'Santa Ana Oeste', 'Santa Ana Norte', 'Metapán', 'Chalchuapa'],
    postalCode: '2101'
  },
  'Sonsonate': {
    municipalities: ['Sonsonate Centro', 'Sonsonate Este', 'Sonsonate Oeste', 'Acajutla', 'Armenia', 'Izalco', 'Nahuizalco'],
    postalCode: '2301'
  },
  'Usulután': {
    municipalities: ['Usulután Norte', 'Usulután Este', 'Usulután Oeste', 'Jiquilisco', 'Puerto El Triunfo', 'Santiago de María'],
    postalCode: '3401'
  },
  'La Paz': {
    municipalities: ['La Paz Este', 'La Paz Oeste', 'La Paz Centro', 'Zacatecoluca', 'San Luis Talpa', 'Olocuilta'],
    postalCode: '1601'
  },
  'Ahuachapán': {
    municipalities: ['Ahuachapán Norte', 'Ahuachapán Centro', 'Ahuachapán Sur', 'Atiquizaya', 'Concepción de Ataco'],
    postalCode: '2001'
  },
  'Cuscatlán': {
    municipalities: ['Cuscatlán Norte', 'Cuscatlán Sur', 'Cojutepeque', 'Suchitoto', 'San Pedro Perulapán'],
    postalCode: '1401'
  },
  'Cabañas': {
    municipalities: ['Cabañas Este', 'Cabañas Oeste', 'Sensuntepeque', 'Ilobasco'],
    postalCode: '1201'
  },
  'Chalatenango': {
    municipalities: ['Chalatenango Norte', 'Chalatenango Centro', 'Chalatenango Sur', 'Nueva Concepción', 'La Palma'],
    postalCode: '1301'
  },
  'San Vicente': {
    municipalities: ['San Vicente Norte', 'San Vicente Sur', 'Apastepeque', 'Verapaz', 'Tecoluca'],
    postalCode: '1701'
  },
  'La Unión': {
    municipalities: ['La Unión Norte', 'La Unión Sur', 'Concepción de Oriente', 'Intipucá', 'Santa Rosa de Lima', 'Pasaquina'],
    postalCode: '3101'
  }
};

interface CheckoutAddressFormProps {
  onSave: (data: any) => void;
}

export function CheckoutAddressForm({ onSave }: CheckoutAddressFormProps) {
  const [formData, setFormData] = useState({
    pais: 'El Salvador',
    nombre: '',
    apellido: '',
    telefono: '',
    departamento: '',
    municipio: '',
    codigoPostal: '',
    calle: '',
    depto: '',
    dui: '',
    email: '',
  });

  // Cargar datos previos guardados en localStorage al iniciar
  useEffect(() => {
    const savedProfile = localStorage.getItem('user_checkout_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Error al cargar perfil guardado', e);
      }
    }
  }, []);

  // Manejar cambios y actualizar dependencias (municipios y código postal)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'departamento') {
      const defaultPostal = svLocations[value]?.postalCode || '';
      setFormData(prev => ({
        ...prev,
        departamento: value,
        municipio: '', // Reiniciar municipio para obligar a elegir del nuevo departamento
        codigoPostal: defaultPostal
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.departamento || !formData.municipio || !formData.calle || !formData.dui) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Guardar en localStorage para futuros autocompletados
    localStorage.setItem('user_checkout_profile', JSON.stringify(formData));

    onSave(formData);
  };

  const availableMunicipalities = formData.departamento ? svLocations[formData.departamento]?.municipalities || [] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Tus datos están protegidos y se autocompletarán en tus próximas compras.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Tu nombre"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Apellido *</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Tu apellido"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Teléfono *</label>
          <div className="flex">
            <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl px-3 py-2.5 text-xs font-bold text-slate-500 flex items-center">+503</span>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="0000 0000"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-r-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">DUI (Facturación) *</label>
          <input
            type="text"
            name="dui"
            value={formData.dui}
            onChange={handleChange}
            placeholder="00000000-0"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Departamento *</label>
          <select
            name="departamento"
            value={formData.departamento}
            onChange={handleChange}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all cursor-pointer"
          >
            <option value="">Selecciona departamento</option>
            {Object.keys(svLocations).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Municipio *</label>
          <select
            name="municipio"
            value={formData.municipio}
            onChange={handleChange}
            required
            disabled={!formData.departamento}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">{formData.departamento ? 'Selecciona municipio' : 'Primero elige departamento'}</option>
            {availableMunicipalities.map(muni => (
              <option key={muni} value={muni}>{muni}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código Postal *</label>
          <input
            type="text"
            name="codigoPostal"
            value={formData.codigoPostal}
            onChange={handleChange}
            placeholder="Ej. 03101"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Correo Electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tucorreo@email.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dirección Exacta (Calle, Colonia, Casa #) *</label>
        <input
          type="text"
          name="calle"
          value={formData.calle}
          onChange={handleChange}
          placeholder="Ej. Polígono B, Casa #12"
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-orange-600/20 cursor-pointer text-sm mt-4"
      >
        Guardar y Continuar al Pago
      </button>
    </form>
  );
}