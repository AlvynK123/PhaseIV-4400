import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Table, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const AirplaneManagement = () => {
  const [airplanes, setAirplanes] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    airlineID: '',
    tail_num: '',
    seat_capacity: '',
    speed: '',
    locationID: '',
    plane_type: '',
    model: '',
    neo: false
  });

  useEffect(() => {
    fetchAirplanes();
    fetchAirlines();
    fetchLocations();
  }, []);

  const fetchAirplanes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airplanes');
      setAirplanes(response.data);
    } catch (error) {
      console.error('Error fetching airplanes:', error);
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airlines');
      setAirlines(response.data);
    } catch (error) {
      console.error('Error fetching airlines:', error);
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/airplanes', formData);
      fetchAirplanes();
      handleClose();
      setFormData({
        airlineID: '',
        tail_num: '',
        seat_capacity: '',
        speed: '',
        locationID: '',
        plane_type: '',
        model: '',
        neo: false
      });
    } catch (error) {
      console.error('Error adding airplane:', error);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h3>Airplane Management</h3>
          <Button variant="primary" onClick={handleShow}>
            Add Airplane
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Airline</th>
              <th>Tail Number</th>
              <th>Seat Capacity</th>
              <th>Speed</th>
              <th>Location</th>
              <th>Type</th>
              <th>Model</th>
              <th>NEO</th>
            </tr>
          </thead>
          <tbody>
            {airplanes.map((airplane) => (
              <tr key={`${airplane.airlineID}-${airplane.tail_num}`}>
                <td>{airplane.airlineID}</td>
                <td>{airplane.tail_num}</td>
                <td>{airplane.seat_capacity}</td>
                <td>{airplane.speed}</td>
                <td>{airplane.locationID}</td>
                <td>{airplane.plane_type}</td>
                <td>{airplane.model}</td>
                <td>{airplane.neo ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={handleClose} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add New Airplane</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Airline</Form.Label>
                    <Form.Select
                      name="airlineID"
                      value={formData.airlineID}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Airline</option>
                      {airlines.map((airline) => (
                        <option key={airline.airlineID} value={airline.airlineID}>
                          {airline.airlineID}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tail Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="tail_num"
                      value={formData.tail_num}
                      onChange={handleInputChange}
                      placeholder="Enter tail number"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Seat Capacity</Form.Label>
                    <Form.Control
                      type="number"
                      name="seat_capacity"
                      value={formData.seat_capacity}
                      onChange={handleInputChange}
                      placeholder="Enter seat capacity"
                      required
                      min="1"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Speed</Form.Label>
                    <Form.Control
                      type="number"
                      name="speed"
                      value={formData.speed}
                      onChange={handleInputChange}
                      placeholder="Enter speed"
                      required
                      min="1"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      name="locationID"
                      value={formData.locationID}
                      onChange={handleInputChange}
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
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Plane Type</Form.Label>
                    <Form.Select
                      name="plane_type"
                      value={formData.plane_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Type</option>
                      <option value="Airbus">Airbus</option>
                      <option value="Boeing">Boeing</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Model</Form.Label>
                    <Form.Control
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="Enter model"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>NEO</Form.Label>
                    <Form.Check
                      type="checkbox"
                      name="neo"
                      checked={formData.neo}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit">
                Add Airplane
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default AirplaneManagement; 