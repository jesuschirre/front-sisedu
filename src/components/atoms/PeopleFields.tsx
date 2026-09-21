import type { ChangeEvent } from "react";

interface PeopleFormData {
  name: string;
  dni: string;
  email: string;
  address: string;
}

interface PeopleFieldsProps {
  value: PeopleFormData;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const inputClass = "w-full rounded-xl border border-gray-800 bg-[#0a0a0c] px-4 py-2.5 text-white shadow-inner outline-none transition-all placeholder-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/50";

export default function PeopleFields({ value, onChange }: PeopleFieldsProps) {
  return (
    <div className="space-y-4">
      <h3 className="mb-4 border-b border-gray-800/60 pb-2 text-xs font-bold uppercase tracking-widest text-violet-400/80">
        Datos Personales
      </h3>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-400">Nombre Completo *</label>
        <input required type="text" name="name" value={value.name} onChange={onChange} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-400">DNI *</label>
        <input required type="text" name="dni" value={value.dni} onChange={onChange} maxLength={8} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-400">Email</label>
        <input type="email" name="email" value={value.email} onChange={onChange} className={inputClass} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-400">Dirección</label>
        <input type="text" name="address" value={value.address} onChange={onChange} className={inputClass} />
      </div>
    </div>
  );
}