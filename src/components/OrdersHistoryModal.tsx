import React, { useEffect, useState } from 'react';
import { X, Package, Calendar, Clock, DollarSign, ChevronRight, RefreshCw } from 'lucide-react';
import { Order } from '../types';
import { api } from '../services/api';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (order: Order) => void;
}

export const OrdersHistoryModal: React.FC<OrdersHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-stone-700" />
            <div>
              <h2 className="font-display text-base font-bold text-stone-900">
                Order History & Invoices
              </h2>
              <p className="text-[11px] text-stone-500">
                Persistent database records created via <code className="font-mono text-stone-700">POST /api/orders</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
              title="Refresh order history"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-stone-500">
              Fetching database records...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <p className="font-medium text-sm text-stone-800">No orders placed yet</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add objects to your shopping bag and complete checkout to trigger the order processing lifecycle.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="p-4 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-semibold text-emerald-700 capitalize">{order.status}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1">
                    {order.customer.fullName} · {order.items.map((i) => `${i.quantity}× ${i.product.name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Destination: {order.customer.city}, {order.customer.postalCode}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-stone-400">
                      {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
