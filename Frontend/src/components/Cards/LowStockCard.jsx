import React from 'react';
import { NavLink } from 'react-router-dom';
import { lowStockProductsMock } from '../../services/initialData';

const LowStockCard = ({ products = [] }) => {
  // Filter products with low stock (<= 15) or fallback to mock
  const lowStock = (products || []).filter(p => p.quantity <= 15);
  const displayItems = lowStock.length > 0 ? lowStock.slice(0, 5) : lowStockProductsMock;

  return (
    <div className="card h-100">
      <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
        <h4 className="mb-0 h5 fw-bold">Low Stock Products</h4>
        <NavLink to="/stage-production" className="small text-primary text-decoration-underline fw-medium">
          View All
        </NavLink>
      </div>

      <ul className="list-group list-group-flush">
        {displayItems.map((item) => (
          <li key={item.id} className="list-group-item d-flex align-items-center gap-3 py-3">
            <img
              src={item.image}
              alt={item.name}
              className="rounded"
              width="48"
              height="48"
              style={{ objectFit: 'cover' }}
            />
            <div className="flex-grow-1">
              <p className="mb-1 fw-semibold text-dark">{item.name}</p>
              <small className="text-muted">ID: #{item.code || item.sku || '554433'}</small>
            </div>
            <div className="d-flex flex-column gap-0 align-items-center">
              <span className="fw-semibold text-primary fs-6">
                {String(item.quantity ?? item.inStock).padStart(2, '0')}
              </span>
              <small className="text-muted">In Stock</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockCard;
