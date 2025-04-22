const express = require('express');
const router = express.Router();
const storedProceduresController = require('../controllers/storedProceduresController');

// Add Airplane
router.post('/add_airplane', storedProceduresController.addAirplane);

// Add Airport
router.post('/add_airport', storedProceduresController.addAirport);

// Add Person
router.post('/add_person', storedProceduresController.addPerson);

// Assign Pilot
router.post('/assign_pilot', storedProceduresController.assignPilot);

// Flight Landing
router.post('/flight_landing', storedProceduresController.flightLanding);

// Flight Takeoff
router.post('/flight_takeoff', storedProceduresController.flightTakeoff);

// Grant/Revoke Pilot License
router.post('/grant_or_revoke_pilot_license', storedProceduresController.grantRevokePilotLicense);

// Offer Flight
router.post('/offer_flight', storedProceduresController.offerFlight);

// Passengers Board
router.post('/passengers_board', storedProceduresController.passengersBoard);

// Passengers Disembark
router.post('/passengers_disembark', storedProceduresController.passengersDisembark);

// Recycle Crew
router.post('/recycle_crew', storedProceduresController.recycleCrew);

// Retire Flight
router.post('/retire_flight', storedProceduresController.retireFlight);

// Simulation Cycle
router.post('/simulation_cycle', storedProceduresController.simulationCycle);

module.exports = router; 