import React, { useState } from 'react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Toto je zatiaľ len jednoduché heslo na ukážku
  // Neskôr to prepojíme bezpečne s tvojím Python backendom
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Kastelan2024') { // Zmeň si na vlastné heslo
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Nesprávne heslo');
    }
  };

  // Ak nie je prihlásený, ukáž login formulár
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-bold text-center text-[#065F46] mb-6">Administrácia Kastelán</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Heslo</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#065F46] outline-none"
                placeholder="Zadajte heslo..."
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button 
              type="submit" 
              className="w-full bg-[#065F46] hover:bg-[#044c38] text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Prihlásiť sa
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Ak je prihlásený, ukáž Admin Nástenku
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Bočné menu */}
      <div className="w-64 bg-[#065F46] text-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-8">Kastelán Admin</h2>
        <nav className="space-y-4">
          <a href="#" className="block p-2 bg-[#044c38] rounded-lg">Rezervácie</a>
          <a href="#" className="block p-2 hover:bg-[#044c38] rounded-lg">Správy</a>
          <a href="#" className="block p-2 hover:bg-[#044c38] rounded-lg">Recenzie</a>
        </nav>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="mt-12 text-sm text-green-200 hover:text-white"
        >
          ← Odhlásiť sa
        </button>
      </div>

      {/* Hlavný obsah */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Prehľad rezervácií</h1>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <p className="text-gray-500">Zatiaľ tu nič nie je. Tu neskôr prepojíme dáta z databázy (mená, termíny, maily), aby ich pán majiteľ videl v peknej tabuľke.</p>
        </div>
      </div>
    </div>
  );
}