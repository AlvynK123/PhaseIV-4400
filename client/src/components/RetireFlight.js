import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const RetireFlight = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    flightID: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('retire_flight', formData);
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

          <Button type="submit">Retire Flight</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default RetireFlight; 