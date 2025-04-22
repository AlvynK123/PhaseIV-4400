import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const GrantRevokePilotLicense = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    personID: '',
    license: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('grant_or_revoke_pilot_license', formData);
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
            <Form.Label>Pilot ID</Form.Label>
            <Form.Control
              type="text"
              name="personID"
              value={formData.personID}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>License Type</Form.Label>
            <Form.Select
              name="license"
              value={formData.license}
              onChange={handleChange}
              required
            >
              <option value="">Select license type</option>
              <option value="Boeing">Boeing</option>
              <option value="Airbus">Airbus</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit">Grant/Revoke License</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GrantRevokePilotLicense; 