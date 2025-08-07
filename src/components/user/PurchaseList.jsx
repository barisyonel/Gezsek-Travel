import React from 'react';
import PurchaseCard from './PurchaseCard';

const PurchaseList = ({ purchases }) => {
  if (!purchases.length) return <div>Henüz satın alınan tur yok.</div>;
  return (
    <div className="purchase-list">
      {purchases.map((purchase, i) => (
        <PurchaseCard key={purchase._id || i} purchase={purchase} />
      ))}
    </div>
  );
};

export default PurchaseList; 