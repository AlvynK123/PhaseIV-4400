import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const AddAirport = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    airportID: '',
    airport_name: '',
    city: '',
    state: '',
    country: '',
    locationID: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('add_airport', formData);
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
            <Form.Label>Airport ID (3 characters)</Form.Label>
            <Form.Control
              type="text"
              name="airportID"
              value={formData.airportID}
              onChange={handleChange}
              maxLength={3}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Airport Name</Form.Label>
            <Form.Control
              type="text"
              name="airport_name"
              value={formData.airport_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>State</Form.Label>
            <Form.Control
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Country (3 characters)</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              maxLength={3}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location ID</Form.Label>
            <Form.Control
              type="text"
              name="locationID"
              value={formData.locationID}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button type="submit">Add Airport</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddAirport; 