import React, { useState } from 'react';
import { useAuth } from '../../app/store';
import { Pagination } from '../CommonComponents';

const InventoryTable = () => {
  const { products = [], deleteProduct } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredProducts = (products || []).filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.code && p.code.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term)) ||
      (p.brand && p.brand.toLowerCase().includes(term))
    );
  });

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleDeleteConfirm = () => {
    if (deleteId && deleteProduct) {
      deleteProduct(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between align-items-center">
        <input
          type="text"
          className="form-control"
          placeholder="Search products..."
          style={{ maxWidth: '280px' }}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="ti ti-filter"></i> Filter
          </button>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="ti ti-file-excel"></i> Excel
          </button>
          <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="ti ti-file-pdf"></i> PDF
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 text-nowrap table-hover align-middle">
            <thead className="table-light border-light">
              <tr>
                <th>Image & Product Name</th>
                <th>Code</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="avatar avatar-md rounded"
                            style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                          />
                        )}
                        <span className="ms-3 fw-medium text-dark">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{p.code}</span></td>
                    <td>{p.category}</td>
                    <td>{p.brand}</td>
                    <td className="fw-bold">${parseFloat(p.price || 0).toFixed(2)}</td>
                    <td>{p.unit}</td>
                    <td>
                      <span className={`fw-bold ${p.quantity <= 10 ? 'text-danger' : 'text-dark'}`}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-icon btn-ghost-secondary me-1 border-0"
                        title="Edit Product"
                      >
                        <i className="ti ti-edit fs-5 text-primary"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-icon btn-ghost-danger border-0"
                        title="Delete Product"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <i className="ti ti-trash fs-5 text-danger"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <i className="ti ti-box-off fs-1 d-block mb-2 opacity-50"></i>
                    No products found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {deleteId && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Delete Product</h5>
                <button type="button" className="btn-close" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">Are you sure you want to delete this product? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                  Delete Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryTable;
