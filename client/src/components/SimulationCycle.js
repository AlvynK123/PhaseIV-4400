import React from 'react';
import { Card, Button } from 'react-bootstrap';

const SimulationCycle = ({ onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('simulation_cycle', {});
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Button onClick={handleSubmit}>Run Simulation Cycle</Button>
      </Card.Body>
    </Card>
  );
};

export default SimulationCycle; 