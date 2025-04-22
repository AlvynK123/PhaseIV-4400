import React, { useState, useRef } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const AddPerson = ({ onSubmit }) => {
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    personID: '',
    first_name: '',
    last_name: '',
    locationID: '',
    taxID: '',
    experience: '',
    miles: '',
    funds: ''
  });

  const [personType, setPersonType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert empty strings to null for optional fields
    const submitData = {
      personID: formData.personID.trim(),
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim() || null,
      locationID: formData.locationID.trim(),
      taxID: personType === 'pilot' ? formData.taxID.trim() : null,
      experience: personType === 'pilot' ? parseInt(formData.experience) || null : null,
      miles: personType === 'passenger' ? parseInt(formData.miles) || null : null,
      funds: personType === 'passenger' ? parseInt(formData.funds) || null : null
    };

    // Log the complete form data
    console.log('Form Data:', formData);
    console.log('Person Type:', personType);
    console.log('Submit Data:', submitData);
    console.log('API Request:', {
      url: 'http://localhost:5001/api/stored-procedures/add_person',
      method: 'POST',
      data: submitData
    });

    // Validate required fields
    if (!submitData.personID || !submitData.first_name || !submitData.locationID) {
      onSubmit('add_person', submitData, formRef);
      return;
    }

    // Validate taxID format if it's a pilot
    if (personType === 'pilot' && submitData.taxID) {
      if (!/^\d{3}-\d{2}-\d{4}$/.test(submitData.taxID)) {
        onSubmit('add_person', submitData, formRef);
        return;
      }
    }

    // Ensure passenger fields are null when adding a pilot
    if (personType === 'pilot') {
      submitData.miles = null;
      submitData.funds = null;
    }

    // Ensure pilot fields are null when adding a passenger
    if (personType === 'passenger') {
      submitData.taxID = null;
      submitData.experience = null;
    }

    // Log the final data being sent
    console.log('Final Submit Data:', submitData);

    onSubmit('add_person', submitData, formRef);
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
        <Form ref={formRef} onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Person ID</Form.Label>
            <Form.Control
              type="text"
              name="personID"
              value={formData.personID}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
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
            <Form.Label>Person Type</Form.Label>
            <Form.Select
              value={personType}
              onChange={(e) => setPersonType(e.target.value)}
              required
            >
              <option value="">Select type</option>
              <option value="pilot">Pilot</option>
              <option value="passenger">Passenger</option>
            </Form.Select>
          </Form.Group>

          {personType === 'pilot' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Tax ID (XXX-XX-XXXX)</Form.Label>
                <Form.Control
                  type="text"
                  name="taxID"
                  value={formData.taxID}
                  onChange={handleChange}
                  placeholder="123-45-6789"
                  pattern="\d{3}-\d{2}-\d{4}"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience (years)</Form.Label>
                <Form.Control
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </>
          )}

          {personType === 'passenger' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Miles</Form.Label>
                <Form.Control
                  type="number"
                  name="miles"
                  value={formData.miles}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Funds</Form.Label>
                <Form.Control
                  type="number"
                  name="funds"
                  value={formData.funds}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </>
          )}

          <Button variant="primary" type="submit">
            Add Person
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AddPerson; 