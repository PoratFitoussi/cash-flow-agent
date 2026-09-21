import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { Plus, Tag, Users, Clock, AlertCircle, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'owners' | 'recurring'>('categories');

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto">
      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
      </header>

      {/* Tab Navigation */}
      <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800/50 mb-6 w-full">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'categories'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span className="hidden sm:inline">Categories</span>
        </button>
        <button
          onClick={() => setActiveTab('owners')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'owners'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Card Owners</span>
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'recurring'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">Recurring</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'categories' && <CategoriesSettings />}
        {activeTab === 'owners' && <CardOwnersSettings />}
        {activeTab === 'recurring' && <div className="text-center text-slate-500 py-12 border border-dashed border-slate-800 rounded-3xl">Recurring Payments coming soon...</div>}
      </div>
    </div>
  );
}

function CategoriesSettings() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAPI('/categories')
      .then(res => {
        setCategories(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIcon.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      setCategories([...categories, { id: tempId, name: newName, icon: newIcon }]);
      setNewName('');
      setNewIcon('');

      // The backend POST /api/categories endpoint might not exist yet, but we wire it up
      await fetchAPI('/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newName, icon: newIcon })
      });
      
      // Optionally refetch here if backend was ready
    } catch (error) {
      console.error("Failed to add category:", error);
      alert("Failed to add category. Backend endpoint might not be ready.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500 animate-pulse">Loading categories...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Category Form */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50">
        <h2 className="text-lg font-bold text-white mb-4">Add Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            placeholder="Emoji (🛒)"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            maxLength={2}
            className="w-20 bg-slate-950 border border-slate-700 rounded-xl px-2 py-3 text-center text-lg text-white outline-none focus:border-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Category Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newName.trim() || !newIcon.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Existing Categories List */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Current Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 flex-row-reverse shadow-sm">
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-slate-200 text-sm" dir="rtl">{cat.name}</span>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-2 text-center py-10 border border-dashed border-slate-800 rounded-3xl text-slate-500 flex flex-col items-center gap-3">
              <AlertCircle className="w-8 h-8 text-slate-600" />
              <p>No categories found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardOwnersSettings() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [ownerName, setOwnerName] = useState('Porat');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAPI('/card-owners')
      .then(res => setOwners(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetchAPI('/card-owners', {
        method: 'POST',
        body: JSON.stringify({ accountId, ownerName })
      });
      setOwners([...owners, res.data]);
      setAccountId('');
    } catch (error) {
      console.error(error);
      alert("Failed to add mapping");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchAPI(`/card-owners/${id}`, { method: 'DELETE' });
      setOwners(owners.filter(o => o.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-8 text-slate-500 animate-pulse">Loading mappings...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800/50">
        <h2 className="text-lg font-bold text-white mb-4">Add Card Rule</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            placeholder="Card Suffix (e.g. 1234)"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
          />
          <select
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-sm text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="Porat">Porat</option>
            <option value="Liza">Liza</option>
          </select>
          <button
            type="submit"
            disabled={isSubmitting || !accountId.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 flex items-center justify-center transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Active Mappings</h2>
        <div className="space-y-3">
          {owners.map((owner) => (
            <div key={owner.id} className="flex items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Card ending in</span>
                <span className="font-bold text-white text-lg tracking-wider">{owner.accountId}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-slate-800 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">{owner.ownerName}</span>
                <button onClick={() => handleDelete(owner.id)} className="text-slate-500 hover:text-red-400 transition-colors p-2 rounded hover:bg-slate-800/50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {owners.length === 0 && (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-3xl text-slate-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6" />
              <p>No card mappings found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
