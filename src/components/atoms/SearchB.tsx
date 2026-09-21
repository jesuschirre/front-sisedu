interface SearchBre {
  text: string;
  search: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SearchB({text, search, handleSearch }: SearchBre) {
  return (
    <div className="relative w-full md:w-2/3 lg:w-1/2">
        
        {/* icono de lupa */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10">
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
        
        {/* Input Neobrutalista */}
        <input
            type="text"
            placeholder={text}
            value={search}
            onChange={handleSearch}
            className="w-full pl-14 pr-4 py-3 bg-white text-black font-mono font-bold text-lg border-4 border-black placeholder-gray-500 outline-none transition-all 
            duration-150 focus:bg-[#D4FF00] focus:shadow-[6px_6px_0_0_#000000] focus:-translate-y-0.5 focus:-translate-x-0.5"
        />

    </div>
  )
}