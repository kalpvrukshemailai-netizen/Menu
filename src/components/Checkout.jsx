import React from 'react';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

export default function Checkout({ onBack }) {
  const { cartItems, updateQuantity, removeFromCart, subtotal, tax, total } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your Order is Empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <button className="premium-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} /> Continue Exploring
        </button>
        <h2>Your Order</h2>
      </div>

      <div className="checkout-grid">
        <div className="checkout-items">
          {cartItems.map((item) => (
            <div key={item.id} className="checkout-item-card">
              <div className="item-thumbnail">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-price">₹{item.price.toLocaleString('en-IN')}</p>
              </div>
              <div className="item-actions">
                <div className="qty-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="summary-row">
            <span>Taxes (5% GST)</span>
            <span>₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          
          <button className="checkout-action-btn">
            <CreditCard size={20} />
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
