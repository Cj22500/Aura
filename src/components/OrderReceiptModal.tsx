import React from 'react';
import { CheckCircle2, PackageCheck, Truck, Calendar, MapPin, X, ArrowRight } from 'lucide-react';
import { Order } from '../types';

interface OrderReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  order,
  onClose,
  onViewOrders
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with success badge */}
        <div className="p-6 bg-stone-50 border-b border-stone-200 text-center space-y-2 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="font-display text-2xl font-bold text-stone-900">
            Order Confirmed & Logged
          </h2>
          <p className="text-xs text-stone-600">
            Thank you, <span className="font-semibold text-stone-900">{order.customer.fullName}</span>. Your acquisition has been recorded via REST API.
          </p>
        </div>

        {/* Order Details & Receipt */}
        <div className="p-6 space-y-6">
          {/* Order Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Order Reference</span>
              <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Status</span>
              <span className="font-semibold text-emerald-700 capitalize">{order.status}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Est. Delivery</span>
              <span className="font-semibold text-stone-800">{order.estimatedDelivery}</span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Total Debited</span>
              <span className="font-mono font-bold text-stone-900 tabular-nums">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Fulfillment Status Progress */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Fulfillment Lifecycle</p>
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                <span className="w-2 h-2 rounded-full bg-stone-900" />
                <span>1. Confirmed</span>
              </div>
              <div className="h-0.5 flex-1 mx-2 bg-stone-900" />
              <div className="flex items-center gap-1.5 text-stone-900 font-medium">
                <span className="w-2 h-2 rounded-full bg-stone-900" />
                <span>2. Preparing Dispatch</span>
              </div>
              <div className="h-0.5 flex-1 mx-2 bg-stone-200" />
              <div className="flex items-center gap-1.5 text-stone-400">
                <span className="w-2 h-2 rounded-full bg-stone-300" />
                <span>3. In Transit</span>
              </div>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider">Acquired Pieces</p>
            <div className="divide-y divide-stone-100 max-h-40 overflow-y-auto pr-1">
              {order.items.map((it) => (
                <div key={it.product.id} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-900">{it.product.name}</span>
                    <span className="text-stone-500 ml-2">Qty: {it.quantity}</span>
                  </div>
                  <span className="font-mono text-stone-800 tabular-nums">
                    ${(it.product.price * it.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Destination Info */}
          <div className="p-3.5 bg-stone-50 rounded-lg text-xs space-y-1 text-stone-600">
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              <span>Dispatched to:</span>
            </div>
            <p className="pl-5 text-stone-700">
              {order.customer.fullName} · {order.customer.address}, {order.customer.city} {order.customer.postalCode}
            </p>
            <p className="pl-5 text-stone-500 text-[11px]">
              Confirmation dispatch sent to {order.customer.email}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={onViewOrders}
            className="text-xs font-medium text-stone-700 hover:text-stone-900 underline cursor-pointer"
          >
            Inspect Order History Database
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
