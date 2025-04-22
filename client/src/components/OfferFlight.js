import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const OfferFlight = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    flightID: '',
    routeID: '',
    support_airline: '',
    support_tail: '',
    progress: '0',
    next_time: '',
    cost: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('offer_flight', {
      ...formData,
      progress: parseInt(formData.progress),
      cost: parseInt(formData.cost)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Flight ID</Form.Label>
            <Form.Control
              type="text"
              name="flightID"
              value={formData.flightID}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Route ID</Form.Label>
            <Form.Control
              type="text"
              name="routeID"
              value={formData.routeID}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Support Airline</Form.Label>
            <Form.Control
              type="text"
              name="support_airline"
              value={formData.support_airline}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Support Tail Number</Form.Label>
            <Form.Control
              type="text"
              name="support_tail"
              value={formData.support_tail}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Progress</Form.Label>
            <Form.Control
              type="number"
              name="progress"
              value={formData.progress}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Next Time (HH:MM:SS)</Form.Label>
            <Form.Control
              type="time"
              name="next_time"
              value={formData.next_time}
              onChange={handleChange}
              step="1"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cost</Form.Label>
            <Form.Control
              type="number"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>

          <Button type="submit">Offer Flight</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default OfferFlight; 