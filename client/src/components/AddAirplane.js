import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const AddAirplane = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    airlineID: '',
    tail_num: '',
    seat_capacity: '',
    speed: '',
    locationID: '',
    plane_type: '',
    maintenanced: false,
    model: '',
    neo: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('add_airplane', {
      ...formData,
      seat_capacity: parseInt(formData.seat_capacity),
      speed: parseInt(formData.speed)
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Airline ID</Form.Label>
            <Form.Control
              type="text"
              name="airlineID"
              value={formData.airlineID}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tail Number</Form.Label>
            <Form.Control
              type="text"
              name="tail_num"
              value={formData.tail_num}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Seat Capacity</Form.Label>
            <Form.Control
              type="number"
              name="seat_capacity"
              value={formData.seat_capacity}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Speed</Form.Label>
            <Form.Control
              type="number"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
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

          <Form.Group className="mb-3">
            <Form.Label>Plane Type</Form.Label>
            <Form.Select
              name="plane_type"
              value={formData.plane_type}
              onChange={handleChange}
              required
            >
              <option value="">Select plane type</option>
              <option value="Boeing">Boeing</option>
              <option value="Airbus">Airbus</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          {formData.plane_type === 'Boeing' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Model</Form.Label>
                <Form.Control
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Maintenanced"
                  name="maintenanced"
                  checked={formData.maintenanced}
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}

          {formData.plane_type === 'Airbus' && (
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Neo"
                name="neo"
                checked={formData.neo}
                onChange={handleChange}
              />
            </Form.Group>
          )}

          <Button type="submit">Add Airplane</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddAirplane; 