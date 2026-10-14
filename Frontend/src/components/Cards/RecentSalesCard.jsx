import React from 'react';
import { recentSalesMock } from '../../services/initialData';

const RecentSalesCard = () => {
  return (
    <div className="card h-100">
      <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
        <h4 className="mb-0 h5 fw-bold">Recent Sales</h4>
        <button className="btn btn-sm btn-outline-secondary">
          <i className="ti ti-calendar-event me-1"></i> Weekly
        </button>
      </div>

      <ul className="list-group list-group-flush">
        {recentSalesMock.map((item) => (
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
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span className="fw-semibold text-dark">{item.category}</span>
                <span>•</span>
                <span>{item.price}</span>
              </div>
            </div>
            <span className={`badge ${item.badgeClass} px-2 py-1`}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSalesCard;
