import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Table, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const PassengerManagement = () => {
  const [passengers, setPassengers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    personID: '',
    first_name: '',
    last_name: '',
    locationID: '',
    miles: 0,
    funds: 0
  });

  useEffect(() => {
    fetchPassengers();
    fetchLocations();
  }, []);

  const fetchPassengers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/passengers');
      setPassengers(response.data);
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/passengers', formData);
      fetchPassengers();
      handleClose();
      setFormData({
        personID: '',
        first_name: '',
        last_name: '',
        locationID: '',
        miles: 0,
        funds: 0
      });
    } catch (error) {
      console.error('Error adding passenger:', error);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h3>Passenger Management</h3>
          <Button variant="primary" onClick={handleShow}>
            Add Passenger
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Location</th>
              <th>Miles</th>
              <th>Funds</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((passenger) => (
              <tr key={passenger.personID}>
                <td>{passenger.personID}</td>
                <td>{passenger.first_name}</td>
                <td>{passenger.last_name}</td>
                <td>{passenger.locationID}</td>
                <td>{passenger.miles}</td>
                <td>{passenger.funds}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add New Passenger</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Person ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="personID"
                      value={formData.personID}
                      onChange={handleInputChange}
                      placeholder="Enter person ID"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      name="locationID"
                      value={formData.locationID}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location.locationID} value={location.locationID}>
                          {location.locationID}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Miles</Form.Label>
                    <Form.Control
                      type="number"
                      name="miles"
                      value={formData.miles}
                      onChange={handleInputChange}
                      placeholder="Enter miles"
                      required
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Funds</Form.Label>
                    <Form.Control
                      type="number"
                      name="funds"
                      value={formData.funds}
                      onChange={handleInputChange}
                      placeholder="Enter funds"
                      required
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit">
                Add Passenger
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default PassengerManagement; 