const db = require('../db');

const storedProceduresController = {
  // Add Airplane
  addAirplane: async (req, res) => {
    try {
      const {
        airlineID,
        tail_num,
        seat_capacity,
        speed,
        locationID,
        plane_type,
        maintenanced,
        model,
        neo
      } = req.body;
  
      // Minimal check for required fields
      if (!airlineID || !tail_num || !locationID) {
        return res.status(400).json({ 
          message: 'Missing required fields: airlineID, tail_num, and locationID are required'
        });
      }
  
      // Call the stored procedure; stored procedure validations handle the business logic.
      const [result] = await db.query(
        'CALL add_airplane(?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [airlineID, tail_num, seat_capacity, speed, locationID, plane_type, maintenanced, model, neo]
      );
      
      res.json({ message: 'Airplane added successfully', result });
  
    } catch (error) {
      console.error('Error in addAirplane:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Add Airport
  addAirport: async (req, res) => {
    try {
      const {
        airportID,
        airport_name,
        city,
        state,
        country,
        locationID
      } = req.body;

      // Minimal check for required fields (adjust as needed)
      if (!airportID || !airport_name || !locationID) {
        return res.status(400).json({
          message: 'Missing required fields: airportID, airport_name, and locationID are required'
        });
      }

      const [result] = await db.query(
        'CALL add_airport(?, ?, ?, ?, ?, ?)',
        [airportID, airport_name, city, state, country, locationID]
      );
      
      res.json({ message: 'Airport added successfully', result });
    } catch (error) {
      console.error('Error in addAirport:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Add Person
  addPerson: async (req, res) => {
    try {
      const {
        personID,
        first_name,
        last_name,
        locationID,
        taxID,
        experience,
        miles,
        funds
      } = req.body;

      // Minimal check for required fields
      if (!personID || !first_name || !last_name || !locationID) {
        return res.status(400).json({
          message: 'Missing required fields: personID, first_name, last_name, and locationID are required'
        });
      }

      const [result] = await db.query(
        'CALL add_person(?, ?, ?, ?, ?, ?, ?, ?)',
        [personID, first_name, last_name, locationID, taxID, experience, miles, funds]
      );
      
      res.json({ message: 'Person added successfully', result });
    } catch (error) {
      console.error('Error in addPerson:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Assign Pilot
  assignPilot: async (req, res) => {
    try {
      const { flightID, personID } = req.body;
      
      if (!flightID || !personID) {
        return res.status(400).json({
          message: 'Missing required fields: flightID and personID are required'
        });
      }
      
      const [result] = await db.query(
        'CALL assign_pilot(?, ?)',
        [flightID, personID]
      );
      
      res.json({ message: 'Pilot assigned successfully', result });
    } catch (error) {
      console.error('Error in assignPilot:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Flight Landing
  flightLanding: async (req, res) => {
    try {
      const { flightID } = req.body;
      
      if (!flightID) {
        return res.status(400).json({ message: 'Missing required field: flightID' });
      }
      
      const [result] = await db.query(
        'CALL flight_landing(?)',
        [flightID]
      );
      
      res.json({ message: 'Flight landed successfully', result });
    } catch (error) {
      console.error('Error in flightLanding:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Flight Takeoff
  flightTakeoff: async (req, res) => {
    try {
      const { flightID } = req.body;
      
      if (!flightID) {
        return res.status(400).json({ message: 'Missing required field: flightID' });
      }
      
      const [result] = await db.query(
        'CALL flight_takeoff(?)',
        [flightID]
      );
      
      res.json({ message: 'Flight took off successfully', result });
    } catch (error) {
      console.error('Error in flightTakeoff:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Grant/Revoke Pilot License
  grantRevokePilotLicense: async (req, res) => {
    try {
      const { personID, license } = req.body;
      
      if (!personID || license === undefined) {
        return res.status(400).json({ message: 'Missing required fields: personID and license' });
      }
      
      const [result] = await db.query(
        'CALL grant_or_revoke_pilot_license(?, ?)',
        [personID, license]
      );
      
      res.json({ message: 'Pilot license updated successfully', result });
    } catch (error) {
      console.error('Error in grantRevokePilotLicense:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Offer Flight
  offerFlight: async (req, res) => {
    try {
      const {
        flightID,
        routeID,
        support_airline,
        support_tail,
        progress,
        next_time,
        cost
      } = req.body;
      
      if (!flightID || !routeID) {
        return res.status(400).json({ message: 'Missing required fields: flightID and routeID are required' });
      }
      
      const [result] = await db.query(
        'CALL offer_flight(?, ?, ?, ?, ?, ?, ?)',
        [flightID, routeID, support_airline, support_tail, progress, next_time, cost]
      );
      
      res.json({ message: 'Flight offered successfully', result });
    } catch (error) {
      console.error('Error in offerFlight:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Passengers Board
  passengersBoard: async (req, res) => {
    try {
      const { flightID } = req.body;
      
      if (!flightID) {
        return res.status(400).json({ message: 'Missing required field: flightID' });
      }
      
      const [result] = await db.query(
        'CALL passengers_board(?)',
        [flightID]
      );
      
      res.json({ message: 'Passengers boarded successfully', result });
    } catch (error) {
      console.error('Error in passengersBoard:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Passengers Disembark
  passengersDisembark: async (req, res) => {
    try {
      const { flightID } = req.body;
      
      if (!flightID) {
        return res.status(400).json({ message: 'Missing required field: flightID' });
      }
      
      const [result] = await db.query(
        'CALL passengers_disembark(?)',
        [flightID]
      );
      
      res.json({ message: 'Passengers disembarked successfully', result });
    } catch (error) {
      console.error('Error in passengersDisembark:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Recycle Crew
  recycleCrew: async (req, res) => {
    try {
      const { flightID } = req.body;
      
      if (!flightID) {
        return res.status(400).json({ message: 'Missing required field: flightID' });
      }
      
      const [result] = await db.query(
        'CALL recycle_crew(?)',
        [flightID]
      );
      
      res.json({ message: 'Crew recycled successfully', result });
    } catch (error) {
      console.error('Error in recycleCrew:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Retire Flight
  retireFlight: async (req, res) => {
    try {
      const { flightID } = req.body;
      
      if (!flightID) {
        return res.status(400).json({ message: 'Missing required field: flightID' });
      }
      
      const [result] = await db.query(
        'CALL retire_flight(?)',
        [flightID]
      );
      
      res.json({ message: 'Flight retired successfully', result });
    } catch (error) {
      console.error('Error in retireFlight:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Simulation Cycle
  simulationCycle: async (req, res) => {
    try {
      const [result] = await db.query('CALL simulation_cycle()');
      res.json({ message: 'Simulation cycle completed successfully', result });
    } catch (error) {
      console.error('Error in simulationCycle:', error);
      if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = storedProceduresController;