import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Banknote, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { CartItem, CustomerInfo, Order, ValidationError } from '../types';
import { api, validateCustomerInfo } from '../services/api';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  couponCode?: string | null;
  couponDiscount: number;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  couponCode,
  couponDiscount,
  onOrderSuccess
}) => {
  const [formData, setFormData] = useState<CustomerInfo>({
    fullName: 'Christian Lindqvist',
    email: 'c.lindqvist@scandic.design',
    phone: '+45 42 19 88 02',
    address: 'Bredgade 44, 2nd Floor',
    city: 'Copenhagen',
    postalCode: '1260',
    paymentMethod: 'card',
    cardNumber: '4532 8920 1829 4410',
    cardExp: '12/28',
    cardCvc: '842',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * couponDiscount) / 100);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping = discountedSubtotal >= 150 ? 0 : 15;
  const tax = Math.round(discountedSubtotal * 0.08);
  const total = discountedSubtotal + shipping + tax;

  const handleFieldChange = (field: keyof CustomerInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate inputs
    const fieldErrors = validateCustomerInfo(formData);
    if (fieldErrors.length > 0) {
      const errMap: Record<string, string> = {};
      fieldErrors.forEach((err) => {
        errMap[err.field] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = await api.createOrder({
        items,
        customer: formData,
        couponCode: couponCode || undefined,
      });

      onOrderSuccess(newOrder);
    } catch (err: any) {
      setApiError(err.message || 'Payment processing failed. Please verify card details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-stone-700" />
            <div>
              <h2 className="font-display text-base font-bold text-stone-900">Secure Checkout</h2>
              <p className="text-[11px] text-stone-500">256-Bit SSL Encrypted Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Form + Summary */}
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Form Fields: 7 Cols */}
          <div className="md:col-span-7 space-y-6">
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Section 1: Contact Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">1. Customer Contact</h3>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder="e.g. Christian Lindqvist"
                  className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                    errors.fullName ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-700'
                  }`}
                />
                {errors.fullName && <p className="text-[10px] text-red-600 mt-0.5">{errors.fullName}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="name@domain.com"
                    className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-700'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-red-600 mt-0.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Telephone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+45 42 19 88 02"
                    className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                      errors.phone ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-700'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-600 mt-0.5">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Delivery Address */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">2. Delivery Address</h3>
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFieldChange('address', e.target.value)}
                  placeholder="Street and house / unit number"
                  className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                    errors.address ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-700'
                  }`}
                />
                {errors.address && <p className="text-[10px] text-red-600 mt-0.5">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="City"
                    className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                      errors.city ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-700'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-red-600 mt-0.5">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                    placeholder="Postal Code"
                    className={`w-full px-3 py-2 text-xs bg-stone-50 border rounded-md outline-none focus:bg-white transition-all ${
                      errors.postalCode ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-700'
                    }`}
                  />
                  {errors.postalCode && <p className="text-[10px] text-red-600 mt-0.5">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* Section 3: Payment Method */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">3. Payment Instrument</h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleFieldChange('paymentMethod', 'card')}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'card'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange('paymentMethod', 'cod')}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cod'
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {formData.paymentMethod === 'card' && (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={formData.cardNumber || ''}
                      onChange={(e) => handleFieldChange('cardNumber', e.target.value)}
                      placeholder="4532 •••• •••• ••••"
                      className={`w-full px-3 py-1.5 text-xs bg-white border font-mono rounded-md outline-none focus:border-stone-700 ${
                        errors.cardNumber ? 'border-red-400' : 'border-stone-300'
                      }`}
                    />
                    {errors.cardNumber && <p className="text-[10px] text-red-600 mt-0.5">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={formData.cardExp || ''}
                        onChange={(e) => handleFieldChange('cardExp', e.target.value)}
                        placeholder="MM/YY"
                        className={`w-full px-3 py-1.5 text-xs bg-white border font-mono rounded-md outline-none focus:border-stone-700 ${
                          errors.cardExp ? 'border-red-400' : 'border-stone-300'
                        }`}
                      />
                      {errors.cardExp && <p className="text-[10px] text-red-600 mt-0.5">{errors.cardExp}</p>}
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">CVC Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={formData.cardCvc || ''}
                        onChange={(e) => handleFieldChange('cardCvc', e.target.value)}
                        placeholder="•••"
                        className={`w-full px-3 py-1.5 text-xs bg-white border font-mono rounded-md outline-none focus:border-stone-700 ${
                          errors.cardCvc ? 'border-red-400' : 'border-stone-300'
                        }`}
                      />
                      {errors.cardCvc && <p className="text-[10px] text-red-600 mt-0.5">{errors.cardCvc}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="md:col-span-5 bg-stone-50 p-5 rounded-xl border border-stone-200 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">Order Summary</h3>

              {/* Items Mini List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.product.id} className="flex justify-between text-xs py-1 border-b border-stone-200/60">
                    <span className="truncate pr-2 text-stone-700">
                      {it.quantity}× {it.product.name}
                    </span>
                    <span className="font-mono text-stone-900 tabular-nums shrink-0">
                      ${(it.product.price * it.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 pt-4 mt-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({couponCode})</span>
                    <span className="font-mono tabular-nums">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Freight</span>
                  <span className="font-mono tabular-nums text-stone-900">
                    {shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span className="font-mono tabular-nums text-stone-900">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Total Amount</span>
                  <span className="font-mono text-base tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4 border-t border-stone-200 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg font-semibold text-sm text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transacting REST API...</span>
                  </>
                ) : (
                  <span>Authorize & Place Order</span>
                )}
              </button>
              <p className="text-[10px] text-center text-stone-400">
                Triggers <code className="font-mono text-stone-600">POST /api/orders</code> with validation & inventory locks.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
