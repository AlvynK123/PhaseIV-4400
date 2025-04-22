import React, { useState } from 'react';
import axios from 'axios';
import { Card, Typography, Modal, Button } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

import AddAirplane from './AddAirplane';
import AddAirport from './AddAirport';
import AddPerson from './AddPerson';
import AssignPilot from './AssignPilot';
import FlightLanding from './FlightLanding';
import FlightTakeoff from './FlightTakeoff';
import GrantRevokePilotLicense from './GrantRevokePilotLicense';
import OfferFlight from './OfferFlight';
import PassengersBoard from './PassengersBoard';
import PassengersDisembark from './PassengersDisembark';
import RecycleCrew from './RecycleCrew';
import RetireFlight from './RetireFlight';
import SimulationCycle from './SimulationCycle';

const { Title } = Typography;

const StoredProcedures = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

  const handleSubmit = async (procedure, data, formRef) => {
    try {
      const response = await axios.post(`http://localhost:5001/api/stored-procedures/${procedure}`, data);
      
      // Show success modal
      setModalTitle('Success');
      setModalMessage(response.data.message || 'Operation completed successfully');
      setModalType('success');
      setShowModal(true);
      
      // Clear form if a form reference was provided
      if (formRef && formRef.current) {
        formRef.current.reset();
      }
    } catch (error) {
      // Show error modal
      setModalTitle('Error');
      setModalMessage(error.response?.data?.message || error.message);
      setModalType('error');
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const cardStyle = {
    marginBottom: '20px',
    position: 'relative'
  };

  return (
    <div style={{ padding: '10px 20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Title level={2} style={{ margin: 0 }}>Stored Procedures</Title>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        <Card title="Add Airplane" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <AddAirplane onSubmit={handleSubmit} />
        </Card>
        <Card title="Add Airport" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <AddAirport onSubmit={handleSubmit} />
        </Card>
        <Card title="Add Person" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <AddPerson onSubmit={handleSubmit} />
        </Card>
        <Card title="Assign Pilot" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <AssignPilot onSubmit={handleSubmit} />
        </Card>
        <Card title="Flight Landing" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <FlightLanding onSubmit={handleSubmit} />
        </Card>
        <Card title="Flight Takeoff" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <FlightTakeoff onSubmit={handleSubmit} />
        </Card>
        <Card title="Grant/Revoke Pilot License" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <GrantRevokePilotLicense onSubmit={handleSubmit} />
        </Card>
        <Card title="Offer Flight" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <OfferFlight onSubmit={handleSubmit} />
        </Card>
        <Card title="Passengers Board" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <PassengersBoard onSubmit={handleSubmit} />
        </Card>
        <Card title="Passengers Disembark" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <PassengersDisembark onSubmit={handleSubmit} />
        </Card>
        <Card title="Recycle Crew" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <RecycleCrew onSubmit={handleSubmit} />
        </Card>
        <Card title="Retire Flight" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <RetireFlight onSubmit={handleSubmit} />
        </Card>
        <Card title="Simulation Cycle" style={cardStyle} headStyle={{ backgroundColor: '#f0f2f5' }}>
          <SimulationCycle onSubmit={handleSubmit} />
        </Card>
      </div>
      
      {/* Modal component */}
      <Modal
        title={modalTitle}
        open={showModal}
        onCancel={handleCloseModal}
        footer={[
          <Button key="ok" type="primary" onClick={handleCloseModal}>
            OK
          </Button>
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {modalType === 'success' ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24, marginRight: 12 }} />
          ) : (
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 24, marginRight: 12 }} />
          )}
          <p style={{ margin: 0 }}>{modalMessage}</p>
        </div>
      </Modal>
    </div>
  );
};

export default StoredProcedures; 