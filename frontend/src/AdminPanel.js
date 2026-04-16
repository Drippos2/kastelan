import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel({ API }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('reservations');
  const [data, setData] = useState({ reservations: [], reviews: [], contacts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tvoj tajný token, ktorý máš aj v server.py
  const ADMIN_TOKEN = "Kastelan123654"; 

  // Funkcia na načítanie všetkého z DB
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const resReservations = await axios.get(`${API}/reservations?token=${ADMIN_TOKEN}`);
      const resReviews = await axios.get(`${API}/reviews`);
      
      setData({
        reservations: Array.isArray(resReservations.data) ? resReservations.data : [],
        reviews: Array.isArray(resReviews.data) ? resReviews.data : [],
        contacts: []
      });
    } catch (err) {
      console.error("Chyba pri sťahovaní dát:", err);
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'Kastelan2024') { 
      setIsAuthenticated(true);
      fetchAllData();
    } else {
      setError('Nesprávne heslo');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border-t-4 border-[#065F46]">
          <h2 className="text-2xl font-bold text-center text-[#065F46] mb-6 font-serif">Kastelán Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#065F46] outline-none"
              placeholder="Vstupné heslo"
            />
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button type="submit" className="w-full bg-[#065F46] hover:bg-[#044c38] text-white font-bold py-3 rounded-lg transition-all shadow-md">
              Vstúpiť do systému
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-800">
      <div className="w-full md:w-64 bg-[#065F46] text-white p-6 shadow-2xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold font-serif tracking-wide text-center md:text-left">Kastelán</h2>
          <p className="text-green-200 text-xs text-center md:text-left uppercase tracking-widest mt-1">Admin Panel</p>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'reservations' ? 'bg-white text-[#065F46] shadow-md' : 'hover:bg-[#044c38]'}`}
          >
            📋 Rezervácie
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`w-full text-left p-3 rounded-xl transition-all ${activeTab === 'reviews' ? 'bg-white text-[#065F46] shadow-md' : 'hover:bg-[#044c38]'}`}
          >
            ⭐ Recenzie
          </button>
        </nav>

        <button onClick={() => window.location.href = '/'} className="mt-20 w-full text-sm text-green-200 hover:text-white border border-green-700 p-2 rounded-lg">
          ← Späť na web
        </button>
      </div>

      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800 capitalize">{activeTab === 'reservations' ? 'Rezervácie' : 'Recenzie'}</h1>
          <button onClick={fetchAllData} className="bg-white p-2 rounded-full shadow hover:shadow-md text-[#065F46]">
            🔄
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-[#065F46]">Načítavam dáta...</div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'reservations' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-xs uppercase text-gray-500 font-bold">Hosť / Kontakt</th>
                      <th className="p-4 text-xs uppercase text-gray-500 font-bold text-center">Izba</th>
                      <th className="p-4 text-xs uppercase text-gray-500 font-bold">Termín</th>
                      <th className="p-4 text-xs uppercase text-gray-500 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-green-50/30 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-900">{res.guest_name}</div>
                          <div className="text-sm text-blue-600">{res.guest_email}</div>
                          <div className="text-xs text-gray-500">{res.guest_phone}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold border">
                             {res.room_id}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium">{res.check_in}</div>
                          <div className="text-sm text-gray-400">do {res.check_out}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                            res.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {res.status === 'confirmed' ? 'Potvrdené' : 'Čakajúce'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.reviews.map((rev) => (
                  <div key={rev._id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#065F46]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{rev.author_name}</h3>
                      <div className="text-orange-400 text-sm">{"★".repeat(rev.rating)}</div>
                    </div>
                    <p className="text-gray-600 italic text-sm">"{rev.text}"</p>
                    <div className="mt-4 text-[10px] text-gray-400 uppercase tracking-tighter">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}