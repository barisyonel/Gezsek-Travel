import React from 'react';

const PurchaseCard = ({ purchase }) => {
  const tour = purchase.tour || {};
  return (
    <div className="purchase-card">
      <div className="purchase-title">{tour.title}</div>
      <div className="purchase-info">
        <span><b>Fiyat:</b> {tour.price}</span>
        <span><b>Durum:</b> {purchase.status}</span>
        <span><b>Satın Alma Tarihi:</b> {new Date(purchase.purchaseDate).toLocaleDateString()}</span>
      </div>
      {tour.details && <div className="purchase-details">{tour.details}</div>}
    </div>
  );
};

export default PurchaseCard; 