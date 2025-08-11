import React, { useEffect, useState } from 'react';
import './OrderStatusPage.css';
import axios from 'axios';

function OrderStatusPage({ orderId }) {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      }
    };
    fetchOrder();
  }, [orderId]);

  const steps = [
    'Pending',
    'Processing',
    'Ready for Shipment',
    'In Transit',
    'Delivered',
  ];

  const getStepIndex = (status) => steps.indexOf(status);

  return (
    <div className="order-status-container">
      <h2>Order Status</h2>

      {order ? (
        <>
          <p><strong>Order ID:</strong> {order.order_id}</p>
          <p><strong>Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
          <p><strong>Status:</strong> {order.status}</p>

          <div className="status-tracker">
            {steps.map((step, index) => (
              <div key={step} className={`status-step ${index <= getStepIndex(order.status) ? 'active' : ''}`}>
                <div className="circle">{index + 1}</div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>Loading order...</p>
      )}
    </div>
  );
}

export default OrderStatusPage;
