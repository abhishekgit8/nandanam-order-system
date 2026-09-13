'use client';

const TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: `Table ${i + 1}`,
  label: `T${i + 1}`,
}));
TABLES.push({ id: 'Takeaway', label: '📦' });

export default function TableSelector({ selected, onSelect, activeOrders = [] }) {
  const getTableStatus = (tableId) => {
    const order = activeOrders.find((o) => o.table_number === tableId);
    if (!order) return 'available';
    if (order.status === 'PENDING') return 'pending';
    return 'served';
  };

  const statusStyles = {
    available: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100',
    pending: 'bg-red-50 border-red-400 text-red-700 animate-pulse',
    served: 'bg-yellow-50 border-yellow-300 text-yellow-700',
  };

  const selectedStyle = 'ring-2 ring-kerala-gold ring-offset-2 bg-kerala-gold text-kerala-charcoal border-kerala-gold';

  return (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-kerala-creamDark">
      <label className="font-bold text-kerala-charcoal text-sm mb-2 block">Select Table:</label>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {TABLES.map((table) => {
          const isSelected = selected === table.id;
          const status = getTableStatus(table.id);
          return (
            <button
              key={table.id}
              onClick={() => onSelect(table.id)}
              className={`p-2 rounded-lg border-2 text-xs font-bold transition flex flex-col items-center gap-0.5 ${
                isSelected ? selectedStyle : statusStyles[status]
              }`}
            >
              <span className="text-sm">{table.label}</span>
              {status === 'pending' && (
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
