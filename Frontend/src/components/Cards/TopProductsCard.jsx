import React from 'react';
import { initialProducts } from '../../services/initialData';

const TopProductsCard = ({ products = [] }) => {
  const displayProds = (products && products.length > 0 ? products : initialProducts).slice(0, 5);

  const getBadgeClass = (index) => {
    const badges = [
      'bg-danger-subtle text-danger border border-danger',
      'bg-primary-subtle text-primary border border-primary',
      'bg-info-subtle text-info border border-info',
      'bg-success-subtle text-success border border-success',
      'bg-warning-subtle text-warning border border-warning',
    ];
    return badges[index % badges.length];
  };

  return (
    <div className="card h-100">
      <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
        <h4 className="mb-0 h5 fw-bold">Top Selling Products</h4>
        <button className="btn btn-sm btn-outline-secondary">
          <i className="ti ti-calendar me-1"></i> Today
        </button>
      </div>

      <ul className="list-group list-group-flush">
        {displayProds.map((prod, idx) => (
          <li key={prod.id} className="list-group-item d-flex align-items-center gap-3 py-3">
            <img
              src={prod.image || initialProducts[0].image}
              alt={prod.name}
              className="rounded"
              width="48"
              height="48"
              style={{ objectFit: 'cover' }}
            />
            <div className="flex-grow-1">
              <p className="mb-1 fw-semibold text-dark">{prod.name}</p>
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span className="fw-semibold text-dark">${prod.price}</span>
                <span>•</span>
                <span>{(prod.unitsSold || 500).toLocaleString()} Units</span>
              </div>
            </div>
            <span className={`badge ${getBadgeClass(idx)} px-2 py-1`}>
              {prod.salesPercentage || (18 + idx * 5)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopProductsCard;
