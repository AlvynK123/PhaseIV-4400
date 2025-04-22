-- CS4400: Introduction to Database Systems: Monday, March 3, 2025
-- Simple Airline Management System Course Project Mechanics [TEMPLATE] (v0)
-- Views, Functions & Stored Procedures

/* This is a standard preamble for most of our scripts.  The intent is to establish
a consistent environment for the database behavior. */
set global transaction isolation level serializable;
set global SQL_MODE = 'ANSI,TRADITIONAL';
set names utf8mb4;
set SQL_SAFE_UPDATES = 0;

set @thisDatabase = 'flight_tracking';
use flight_tracking;
-- -----------------------------------------------------------------------------
-- stored procedures and views
-- -----------------------------------------------------------------------------
/* Standard Procedure: If one or more of the necessary conditions for a procedure to
be executed is false, then simply have the procedure halt execution without changing
the database state. Do NOT display any error messages, etc. */

-- [_] supporting functions, views and stored procedures
-- -----------------------------------------------------------------------------
/* Helpful library capabilities to simplify the implementation of the required
views and procedures. */
-- -----------------------------------------------------------------------------
drop function if exists leg_time;
delimiter //
create function leg_time (ip_distance integer, ip_speed integer)
	returns time reads sql data
begin
	declare total_time decimal(10,2);
    declare hours, minutes integer default 0;
    set total_time = ip_distance / ip_speed;
    set hours = truncate(total_time, 0);
    set minutes = truncate((total_time - hours) * 60, 0);
    return maketime(hours, minutes, 0);
end //
delimiter ;

-- [1] add_airplane()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new airplane.  A new airplane must be sponsored
by an existing airline, and must have a unique tail number for that airline.
username.  An airplane must also have a non-zero seat capacity and speed. An airplane
might also have other factors depending on it's type, like the model and the engine.  
Finally, an airplane must have a new and database-wide unique location
since it will be used to carry passengers. */
-- -----------------------------------------------------------------------------
drop procedure if exists add_airplane;
delimiter //
CREATE PROCEDURE add_airplane(
    IN ip_airlineID VARCHAR(50),
    IN ip_tail_num VARCHAR(50),
    IN ip_seat_capacity INTEGER,
    IN ip_speed INTEGER,
    IN ip_locationID VARCHAR(50),
    IN ip_plane_type VARCHAR(100),
    IN ip_maintenanced BOOLEAN,
    IN ip_model VARCHAR(50),
    IN ip_neo BOOLEAN
)
sp_main: BEGIN
    -- Minimal check for required fields (if needed)
    IF ip_airlineID IS NULL OR ip_tail_num IS NULL OR ip_locationID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required fields.';
        leave sp_main;
    END IF;

    -- Check that the airline exists
    IF (SELECT COUNT(*) FROM airline WHERE airlineID = ip_airlineID) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The specified airline does not exist.';
        leave sp_main;
    END IF;

    -- Further validations can be added similarly:
    IF ip_plane_type = 'Boeing' THEN
        IF ip_model IS NULL OR ip_maintenanced IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Boeing planes require model and maintenanced fields.';
            leave sp_main;
        END IF;
        IF ip_maintenanced NOT IN (0,1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid value for maintenanced.';
            leave sp_main;
        END IF;
    ELSEIF ip_plane_type = 'Airbus' THEN
        IF ip_neo IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airbus planes require neo field.';
            leave sp_main;
        END IF;
        IF ip_neo NOT IN (0,1) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid value for neo.';
            leave sp_main;
        END IF;
    ELSE
        IF ip_model IS NOT NULL OR ip_maintenanced IS NOT NULL OR ip_neo IS NOT NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Non-Boeing/Airbus planes cannot have type-specific fields.';
            leave sp_main;
        END IF;
    END IF;

    -- Validate uniqueness of locationID
    IF (SELECT COUNT(*) FROM location WHERE locationID = ip_locationID) > 0
       OR (SELECT COUNT(*) FROM airport WHERE locationID = ip_locationID) > 0
       OR (SELECT COUNT(*) FROM airplane WHERE locationID = ip_locationID) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'The locationID already exists in the system.';
        leave sp_main;
    END IF;

    -- Validate unique tail number for this airline
    IF (SELECT COUNT(*) FROM airplane WHERE tail_num = ip_tail_num AND airlineID = ip_airlineID) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tail number already exists for this airline.';
        leave sp_main;
    END IF;

    -- Validate numeric fields
    IF ip_seat_capacity <= 0 OR ip_speed <= 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'seat_capacity and speed must be positive numbers.';
        leave sp_main;
    END IF;

    -- Insert a new location record
    INSERT INTO location (locationID) VALUES (ip_locationID);

    -- Insert the airplane record
    INSERT INTO airplane (airlineID, tail_num, seat_capacity, speed, locationID, plane_type, maintenanced, model, neo)
    VALUES (ip_airlineID, ip_tail_num, ip_seat_capacity, ip_speed, ip_locationID, ip_plane_type, ip_maintenanced, ip_model, ip_neo);
END //
DELIMITER ;

-- [2] add_airport()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new airport.  A new airport must have a unique
identifier along with a new and database-wide unique location if it will be used
to support airplane takeoffs and landings.  An airport may have a longer, more
descriptive name.  An airport must also have a city, state, and country designation. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS add_airport;
DELIMITER //
CREATE PROCEDURE add_airport (
    IN ip_airportID CHAR(3), 
    IN ip_airport_name VARCHAR(200),
    IN ip_city VARCHAR(100), 
    IN ip_state VARCHAR(100), 
    IN ip_country CHAR(3), 
    IN ip_locationID VARCHAR(50)
)
sp_main: 
BEGIN
    -- Check for required fields
    IF ip_airportID IS NULL OR ip_city IS NULL OR ip_state IS NULL OR ip_country IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required fields for airport.';
        LEAVE sp_main;
    END IF;
    
    -- Check that the airport ID is unique
    IF (SELECT COUNT(*) FROM airport WHERE airportID = ip_airportID) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airport ID already exists.';
        LEAVE sp_main;
    END IF;
    
    -- Check that the locationID is unique (across location, airport, airplane)
    IF ip_locationID IS NOT NULL 
       AND (
            (SELECT COUNT(*) FROM location WHERE locationID = ip_locationID) > 0
         OR (SELECT COUNT(*) FROM airport WHERE locationID = ip_locationID) > 0
         OR (SELECT COUNT(*) FROM airplane WHERE locationID = ip_locationID) > 0
       ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Location ID already used.';
        LEAVE sp_main;
    END IF;
    
    -- Add airport and its location into respective tables
    INSERT INTO location (locationID)
      VALUES (ip_locationID);
    
    INSERT INTO airport (airportID, airport_name, city, state, country, locationID)
      VALUES (ip_airportID, ip_airport_name, ip_city, ip_state, ip_country, ip_locationID);
END //
DELIMITER ;

-- [3] add_person()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new person.  A new person must reference a unique
identifier along with a database-wide unique location used to determine where the
person is currently located: either at an airport, or on an airplane, at any given
time.  A person must have a first name, and might also have a last name.

A person can hold a pilot role or a passenger role (exclusively).  As a pilot,
a person must have a tax identifier to receive pay, and an experience level.  As a
passenger, a person will have some amount of frequent flyer miles, along with a
certain amount of funds needed to purchase tickets for flights. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS add_person;
DELIMITER //
CREATE PROCEDURE add_person (
    IN ip_personID VARCHAR(50), 
    IN ip_first_name VARCHAR(100),
    IN ip_last_name VARCHAR(100), 
    IN ip_locationID VARCHAR(50), 
    IN ip_taxID VARCHAR(50),
    IN ip_experience INTEGER, 
    IN ip_miles INTEGER, 
    IN ip_funds INTEGER
)
sp_main:
BEGIN
    -- Check for required fields
    IF ip_personID IS NULL OR ip_first_name IS NULL OR ip_locationID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required fields for person.';
        LEAVE sp_main;
    END IF;
    
    -- Check that numeric fields are non-negative (if provided)
    IF (ip_experience IS NOT NULL AND ip_experience < 0) 
       OR (ip_miles IS NOT NULL AND ip_miles < 0) 
       OR (ip_funds IS NOT NULL AND ip_funds < 0) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Experience, miles, and funds must be non-negative.';
        LEAVE sp_main;
    END IF;
    
    -- Validate taxID format if provided
    IF ip_taxID IS NOT NULL THEN
        IF LENGTH(ip_taxID) != 11 
           OR SUBSTRING(ip_taxID, 4, 1) != '-' 
           OR SUBSTRING(ip_taxID, 7, 1) != '-' 
           OR ip_taxID NOT REGEXP '^[0-9]{3}-[0-9]{2}-[0-9]{4}$' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid tax ID format.';
            LEAVE sp_main;
        END IF;
    END IF;
    
    -- Ensure no duplicate pilot with same taxID exists
    IF (SELECT COUNT(*) FROM pilot WHERE taxID = ip_taxID) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pilot with this tax ID already exists.';
        LEAVE sp_main;
    END IF;
    
    -- Check that the location exists
    IF (SELECT COUNT(*) FROM location WHERE locationID = ip_locationID) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid location ID.';
        LEAVE sp_main;
    END IF;
    
    -- Ensure that the person ID is unique
    IF (SELECT COUNT(*) FROM person WHERE personID = ip_personID) > 0 THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Person ID already exists.';
        LEAVE sp_main;
    END IF;
    
    -- Ensure role exclusivity (pilot vs. passenger)
    IF (ip_taxID IS NOT NULL AND ip_experience IS NOT NULL) THEN
        IF (ip_miles IS NOT NULL OR ip_funds IS NOT NULL) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot provide both pilot and passenger info.';
            LEAVE sp_main;
        END IF;
    END IF;
    
    IF (ip_miles IS NOT NULL AND ip_funds IS NOT NULL) THEN
        IF (ip_taxID IS NOT NULL OR ip_experience IS NOT NULL) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot provide both passenger and pilot info.';
            LEAVE sp_main;
        END IF;
    END IF;
    
    IF (ip_taxID IS NULL OR ip_experience IS NULL) AND (ip_miles IS NULL OR ip_funds IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Incomplete role information: must be either pilot or passenger.';
        LEAVE sp_main;
    END IF;
    
    IF (ip_taxID IS NOT NULL AND ip_experience IS NULL) OR (ip_taxID IS NULL AND ip_experience IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Incomplete pilot information: both tax ID and experience are required.';
        LEAVE sp_main;
    END IF;
    
    IF (ip_miles IS NOT NULL AND ip_funds IS NULL) OR (ip_miles IS NULL AND ip_funds IS NOT NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Incomplete passenger information: both miles and funds are required.';
        LEAVE sp_main;
    END IF;
    
    -- Insert person
    INSERT INTO person (personID, first_name, last_name, locationID) 
       VALUES (ip_personID, ip_first_name, ip_last_name, ip_locationID);
    
    -- Depending on role, insert into pilot or passenger
    IF (ip_taxID IS NOT NULL AND ip_experience IS NOT NULL) THEN
        INSERT INTO pilot (personID, taxID, experience, commanding_flight)
           VALUES (ip_personID, ip_taxID, ip_experience, NULL);
    ELSE
        INSERT INTO passenger (personID, miles, funds)
           VALUES (ip_personID, ip_miles, ip_funds);
    END IF;
    
END //
DELIMITER ;

-- [4] grant_or_revoke_pilot_license()
-- -----------------------------------------------------------------------------
/* This stored procedure inverts the status of a pilot license.  If the license
doesn't exist, it must be created; and, if it aready exists, then it must be removed. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS grant_or_revoke_pilot_license;
DELIMITER //
CREATE PROCEDURE grant_or_revoke_pilot_license (
    IN ip_personID VARCHAR(50), 
    IN ip_license VARCHAR(100)
)
sp_main:
BEGIN
    DECLARE pilot_count INT;
    DECLARE license_count INT;
    
    IF ip_personID IS NULL OR ip_license IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required fields for pilot license operation.';
        LEAVE sp_main;
    END IF;
    
    SELECT COUNT(*) INTO pilot_count FROM pilot WHERE personID = ip_personID;
    IF pilot_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Person is not a valid pilot.';
        LEAVE sp_main;
    END IF;
    
    SELECT COUNT(*) INTO license_count FROM pilot_licenses WHERE personID = ip_personID AND license = ip_license;
    IF license_count > 0 THEN
        DELETE FROM pilot_licenses WHERE personID = ip_personID AND license = ip_license;
        -- (No SIGNAL here since deletion is a valid alternate path)
    ELSE 
        INSERT INTO pilot_licenses (personID, license)
           VALUES (ip_personID, ip_license);
    END IF;
    
END //
DELIMITER ;

-- [5] offer_flight()
-- -----------------------------------------------------------------------------
/* This stored procedure creates a new flight.  The flight can be defined before
an airplane has been assigned for support, but it must have a valid route.  And
the airplane, if designated, must not be in use by another flight.  The flight
can be started at any valid location along the route except for the final stop,
and it will begin on the ground.  You must also include when the flight will
takeoff along with its cost. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS offer_flight;
DELIMITER //
CREATE PROCEDURE offer_flight (
    IN ip_flightID VARCHAR(50), 
    IN ip_routeID VARCHAR(50),
    IN ip_support_airline VARCHAR(50), 
    IN ip_support_tail VARCHAR(50), 
    IN ip_progress INTEGER,
    IN ip_next_time TIME, 
    IN ip_cost INTEGER
)
sp_main:
BEGIN
    IF ip_flightID IS NULL OR ip_routeID IS NULL OR ip_progress IS NULL OR ip_next_time IS NULL OR ip_cost IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required fields for flight offer.';
        LEAVE sp_main;
    END IF;
    
    IF ip_cost < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cost must be non-negative.';
        LEAVE sp_main;
    END IF;
    
    IF ip_progress < 0 THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Progress must be non-negative.';
        LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM route_path WHERE routeID = ip_routeID) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Route path does not exist for given route.';
        LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM flight WHERE flightID = ip_flightID) > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight ID already exists.';
        LEAVE sp_main;
    END IF;
    
    -- Ensure airplane support information is complete
    IF (ip_support_airline IS NULL AND ip_support_tail IS NOT NULL)
       OR (ip_support_airline IS NOT NULL AND ip_support_tail IS NULL) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Incomplete airplane support information.';
        LEAVE sp_main;
    END IF;
    
    IF ip_support_airline IS NOT NULL AND ip_support_tail IS NOT NULL THEN
        IF NOT EXISTS (SELECT tail_num FROM airplane WHERE airlineID = ip_support_airline AND tail_num = ip_support_tail) THEN 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airplane support not found.';
            LEAVE sp_main;
        END IF;
        IF EXISTS (SELECT flightID FROM flight 
                   WHERE support_airline = ip_support_airline AND support_tail = ip_support_tail 
                     AND airplane_status IN ('on_ground', 'in_flight')) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airplane is already in use.';
            LEAVE sp_main;
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT routeID FROM route WHERE routeID = ip_routeID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Route does not exist.';
        LEAVE sp_main;
    END IF;
    
    IF ip_progress >= (SELECT COUNT(*) FROM route_path WHERE routeID = ip_routeID) THEN 
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Progress exceeds route length.';
        LEAVE sp_main;
    END IF;
    
    -- Create the flight with the airplane starting on the ground
    INSERT INTO flight (flightID, routeID, support_airline, support_tail, progress, airplane_status, next_time, cost)
      VALUES (ip_flightID, ip_routeID, ip_support_airline, ip_support_tail, ip_progress, 'on_ground', ip_next_time, ip_cost);
      
END //
DELIMITER ;

-- [6] flight_landing()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for a flight landing at the next airport
along it's route.  The time for the flight should be moved one hour into the future
to allow for the flight to be checked, refueled, restocked, etc. for the next leg
of travel.  Also, the pilots of the flight should receive increased experience, and
the passengers should have their frequent flyer miles updated. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS flight_landing;
DELIMITER //
CREATE PROCEDURE flight_landing (IN ip_flightID VARCHAR(50))
sp_main:
BEGIN
    IF ip_flightID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing flight ID.';
        LEAVE sp_main;
    END IF;
    
    -- Ensure that the flight exists and is in the air
    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status = 'in_flight') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not in flight.';
        LEAVE sp_main;
    END IF;
    
    -- Increment the pilot's experience by 1
    UPDATE pilot
      SET experience = experience + 1
      WHERE commanding_flight = ip_flightID;
    
    -- Ensure a matching route path exists
    IF NOT EXISTS (
        SELECT * FROM route_path 
         WHERE routeID = (SELECT routeID FROM flight WHERE flightID = ip_flightID)
           AND sequence = (SELECT progress FROM flight WHERE flightID = ip_flightID)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching route path found.';
        LEAVE sp_main;
    END IF;
    
    -- Increment the frequent flyer miles of all passengers on the plane
    UPDATE passenger
      SET miles = miles + (
        SELECT distance FROM leg
          WHERE legID = (
            SELECT legID FROM route_path
              WHERE routeID = (SELECT routeID FROM flight WHERE flightID = ip_flightID)
                AND sequence = (SELECT progress FROM flight WHERE flightID = ip_flightID)
          )
      )
      WHERE personID IN (
        SELECT personID FROM person
          WHERE locationID = (
            SELECT locationID FROM airplane
              WHERE airlineID = (SELECT support_airline FROM flight WHERE flightID = ip_flightID)
                AND tail_num = (SELECT support_tail FROM flight WHERE flightID = ip_flightID)
          )
      );
      
    -- Update the flight status to on_ground and increment next_time by one hour
    UPDATE flight
      SET airplane_status = 'on_ground', next_time = ADDTIME(next_time, '01:00:00')
      WHERE flightID = ip_flightID;
      
END //
DELIMITER ;

-- [7] flight_takeoff()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for a flight taking off from its current
airport towards the next airport along it's route.  The time for the next leg of
the flight must be calculated based on the distance and the speed of the airplane.
And we must also ensure that Airbus and general planes have at least one pilot
assigned, while Boeing must have a minimum of two pilots. If the flight cannot take
off because of a pilot shortage, then the flight must be delayed for 30 minutes. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS flight_landing;
DELIMITER //
CREATE PROCEDURE flight_landing (IN ip_flightID VARCHAR(50))
sp_main:
BEGIN
    IF ip_flightID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing flight ID.';
        LEAVE sp_main;
    END IF;
    
    -- Ensure that the flight exists and is in the air
    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status = 'in_flight') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not in flight.';
        LEAVE sp_main;
    END IF;
    
    -- Increment the pilot's experience by 1
    UPDATE pilot
      SET experience = experience + 1
      WHERE commanding_flight = ip_flightID;
    
    -- Ensure a matching route path exists
    IF NOT EXISTS (
        SELECT * FROM route_path 
         WHERE routeID = (SELECT routeID FROM flight WHERE flightID = ip_flightID)
           AND sequence = (SELECT progress FROM flight WHERE flightID = ip_flightID)
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching route path found.';
        LEAVE sp_main;
    END IF;
    
    -- Increment the frequent flyer miles of all passengers on the plane
    UPDATE passenger
      SET miles = miles + (
        SELECT distance FROM leg
          WHERE legID = (
            SELECT legID FROM route_path
              WHERE routeID = (SELECT routeID FROM flight WHERE flightID = ip_flightID)
                AND sequence = (SELECT progress FROM flight WHERE flightID = ip_flightID)
          )
      )
      WHERE personID IN (
        SELECT personID FROM person
          WHERE locationID = (
            SELECT locationID FROM airplane
              WHERE airlineID = (SELECT support_airline FROM flight WHERE flightID = ip_flightID)
                AND tail_num = (SELECT support_tail FROM flight WHERE flightID = ip_flightID)
          )
      );
      
    -- Update the flight status to on_ground and increment next_time by one hour
    UPDATE flight
      SET airplane_status = 'on_ground', next_time = ADDTIME(next_time, '01:00:00')
      WHERE flightID = ip_flightID;
      
END //
DELIMITER ;

-- [8] passengers_board()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for passengers getting on a flight at
its current airport.  The passengers must be at the same airport as the flight,
and the flight must be heading towards that passenger's desired destination.
Also, each passenger must have enough funds to cover the flight.  Finally, there
must be enough seats to accommodate all boarding passengers. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS passengers_board;
DELIMITER //
CREATE PROCEDURE passengers_board (IN ip_flightID VARCHAR(50))
sp_main: BEGIN
    DECLARE f_routeID VARCHAR(50);
    DECLARE f_progress INT;
    DECLARE f_airlineID VARCHAR(50);
    DECLARE f_tail_num VARCHAR(50);
    DECLARE f_legID VARCHAR(50);
    DECLARE f_from_airport CHAR(3);
    DECLARE f_to_airport CHAR(3);
    DECLARE f_cost INT;
    DECLARE f_seat_capacity INT;
    DECLARE f_boarding_count INT;
    DECLARE f_locationID VARCHAR(50); 

    IF ip_flightID IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing flight ID.';
         LEAVE sp_main;
    END IF;

    IF ip_flightID NOT IN (SELECT flightID FROM flight) THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight does not exist.';
         LEAVE sp_main;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status = 'on_ground') THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not on the ground.';
         LEAVE sp_main;
    END IF;

    SELECT routeID, progress, support_airline, support_tail, cost
         INTO f_routeID, f_progress, f_airlineID, f_tail_num, f_cost
    FROM flight
    WHERE flightID = ip_flightID;
    
    IF f_progress >= (SELECT COUNT(*) FROM route_path WHERE routeID = f_routeID) THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight has no further legs to be flown.';
         LEAVE sp_main;
    END IF;
    
    SELECT legID INTO f_legID
      FROM route_path
      WHERE routeID = f_routeID AND sequence = f_progress + 1;
    SELECT departure, arrival INTO f_from_airport, f_to_airport
      FROM leg
      WHERE legID = f_legID;
    SELECT locationID INTO f_locationID
      FROM airport
      WHERE airportID = f_from_airport;
    SELECT seat_capacity INTO f_seat_capacity
      FROM airplane
      WHERE airlineID = f_airlineID AND tail_num = f_tail_num;

    SELECT COUNT(*) INTO f_boarding_count
      FROM person p
      JOIN passenger p1 ON p.personID = p1.personID
      JOIN passenger_vacations p2 ON p.personID = p2.personID AND p2.sequence = 1
      WHERE p.locationID = f_locationID AND p2.airportID = f_to_airport AND p1.funds >= f_cost;

    IF f_boarding_count > f_seat_capacity THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Not enough seats for all boarding passengers.';
         LEAVE sp_main;
    END IF;

    UPDATE person p
    JOIN passenger p1 ON p.personID = p1.personID
    JOIN passenger_vacations p2 ON p.personID = p2.personID AND p2.sequence = 1
    SET p.locationID = (SELECT locationID FROM airplane WHERE airlineID = f_airlineID AND tail_num = f_tail_num),
        p1.funds = p1.funds - f_cost 
    WHERE p.locationID = f_locationID AND p2.airportID = f_to_airport AND p1.funds >= f_cost;

END //
DELIMITER ;

-- [9] passengers_disembark()
-- -----------------------------------------------------------------------------
/* This stored procedure updates the state for passengers getting off of a flight
at its current airport.  The passengers must be on that flight, and the flight must
be located at the destination airport as referenced by the ticket. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS passengers_disembark;
DELIMITER //
CREATE PROCEDURE passengers_disembark (IN ip_flightID VARCHAR(50))
sp_main: BEGIN
    DECLARE dest_airport CHAR(3);
    DECLARE dest_locationID VARCHAR(50);
    
    IF ip_flightID IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing flight ID.';
         LEAVE sp_main;
    END IF;

    IF ip_flightID NOT IN (SELECT flightID FROM flight) THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight does not exist.';
         LEAVE sp_main;
    END IF;

    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status = 'on_ground') THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not on the ground.';
         LEAVE sp_main;
    END IF;

    SET dest_airport = (
         SELECT l.arrival 
         FROM leg l 
         JOIN route_path r ON l.legID = r.legID
         JOIN flight f ON r.routeID = f.routeID
         WHERE f.flightID = ip_flightID AND r.sequence = f.progress
         LIMIT 1
    );
    
    IF dest_airport IS NULL THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Destination airport not found.';
         LEAVE sp_main;
    END IF;

    SET dest_locationID = (
         SELECT locationID 
         FROM airport 
         WHERE airportID = dest_airport
         LIMIT 1
    );
    
    IF dest_locationID IS NULL THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Destination location not found.';
         LEAVE sp_main;
    END IF;
    
    UPDATE person p 
    JOIN passenger p1 ON p.personID = p1.personID 
    SET p.locationID = dest_locationID
    WHERE p.locationID = (
         SELECT a.locationID 
         FROM airplane a 
         JOIN flight f ON a.airlineID = f.support_airline AND a.tail_num = f.support_tail 
         WHERE f.flightID = ip_flightID 
         LIMIT 1
    )
    AND EXISTS (
         SELECT * FROM passenger_vacations p2 
         WHERE p2.personID = p.personID AND p2.airportID = dest_airport 
         AND p2.sequence = (SELECT MIN(sequence) FROM passenger_vacations WHERE personID = p.personID)
    );
    
    DELETE p2
    FROM passenger_vacations p2
    JOIN (
         SELECT personID, MIN(sequence) AS min_seq 
         FROM passenger_vacations 
         WHERE airportID = dest_airport 
         GROUP BY personID
    ) AS p3 
    ON p2.personID = p3.personID AND p2.sequence = p3.min_seq;

END //
DELIMITER ;

-- [10] assign_pilot()
-- -----------------------------------------------------------------------------
/* This stored procedure assigns a pilot as part of the flight crew for a given
flight.  The pilot being assigned must have a license for that type of airplane,
and must be at the same location as the flight.  Also, a pilot can only support
one flight (i.e. one airplane) at a time.  The pilot must be assigned to the flight
and have their location updated for the appropriate airplane. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS assign_pilot;
DELIMITER //
CREATE PROCEDURE assign_pilot (IN ip_flightID VARCHAR(50), IN ip_personID VARCHAR(50))
sp_main: BEGIN
    DECLARE f_plane_type VARCHAR(50);
    DECLARE f_routeID VARCHAR(50);
    DECLARE f_progress INT;
    DECLARE f_airlineID VARCHAR(50);
    DECLARE f_tail_num VARCHAR(50);
    DECLARE f_cost INT;
    DECLARE pilot_airport VARCHAR(50);
    DECLARE flight_dep VARCHAR(50);
    DECLARE airplane_loc VARCHAR(50);

    IF ip_flightID IS NULL OR ip_personID IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing required fields: flightID and personID.';
         LEAVE sp_main;
    END IF;
    
    IF ip_flightID NOT IN (SELECT flightID FROM flight) THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight does not exist.';
         LEAVE sp_main;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status = 'on_ground') THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not on the ground.';
         LEAVE sp_main;
    END IF;
    
    SELECT routeID, progress, support_airline, support_tail, cost 
         INTO f_routeID, f_progress, f_airlineID, f_tail_num, f_cost 
    FROM flight 
    WHERE flightID = ip_flightID;
    
    IF f_progress >= (SELECT MAX(sequence) FROM route_path WHERE routeID = f_routeID) THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight has already completed its route.';
         LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM person WHERE personID = ip_personID) = 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pilot does not exist.';
         LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM pilot WHERE personID = ip_personID) = 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Person is not a pilot.';
         LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM pilot WHERE personID = ip_personID AND commanding_flight IS NOT NULL) <> 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pilot is already assigned to a flight.';
         LEAVE sp_main;
    END IF;
    
    SELECT p.plane_type INTO f_plane_type 
         FROM airplane p 
         JOIN flight f ON p.airlineID = f.support_airline AND p.tail_num = f.support_tail
         WHERE f.flightID = ip_flightID;
    
    IF f_plane_type IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airplane type not found.';
         LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM pilot_licenses WHERE personID = ip_personID AND license = f_plane_type) = 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pilot does not hold the required license.';
         LEAVE sp_main;
    END IF;
    
    SELECT a.airportID INTO pilot_airport 
         FROM airport a 
         JOIN person p ON a.locationID = p.locationID 
         WHERE p.personID = ip_personID;
    
    SELECT l.departure INTO flight_dep 
         FROM flight f 
         JOIN route_path rp ON f.routeID = rp.routeID
         JOIN leg l ON rp.legID = l.legID 
         WHERE f.flightID = ip_flightID AND rp.sequence = f.progress 
         LIMIT 1;
    
    IF pilot_airport <> flight_dep THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pilot is not at the departure airport.';
         LEAVE sp_main;
    END IF;
    
    SELECT a.locationID INTO airplane_loc 
         FROM airplane a 
         JOIN flight f ON a.airlineID = f.support_airline AND a.tail_num = f.support_tail 
         WHERE f.flightID = ip_flightID;
    
    IF airplane_loc IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airplane location not found.';
         LEAVE sp_main;
    END IF;
    
    UPDATE pilot SET commanding_flight = ip_flightID 
         WHERE personID = ip_personID;
    UPDATE person SET locationID = airplane_loc 
         WHERE personID = ip_personID;

END //
DELIMITER ;


-- [11] recycle_crew()
-- -----------------------------------------------------------------------------
/* This stored procedure releases the assignments for a given flight crew.  The
flight must have ended, and all passengers must have disembarked. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS recycle_crew;
DELIMITER //
CREATE PROCEDURE recycle_crew (IN ip_flightID VARCHAR(50))
sp_main: BEGIN
    DECLARE arrival_loc VARCHAR(50);
    DECLARE f_routeID VARCHAR(50);
    DECLARE f_progress INT;
    DECLARE f_airlineID VARCHAR(50);
    DECLARE f_tail_num VARCHAR(50);
    DECLARE f_cost INT;
    
    IF ip_flightID IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing flight ID.';
         LEAVE sp_main;
    END IF;
    
    IF ip_flightID NOT IN (SELECT flightID FROM flight) THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight does not exist.';
         LEAVE sp_main;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status LIKE 'on_ground') THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not on the ground.';
         LEAVE sp_main;
    END IF;
    
    SELECT routeID, progress, support_airline, support_tail, cost 
         INTO f_routeID, f_progress, f_airlineID, f_tail_num, f_cost 
         FROM flight WHERE flightID = ip_flightID;
    
    IF f_progress < (SELECT COUNT(*) FROM route_path WHERE routeID = f_routeID) THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight still has further legs to be flown.';
         LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM airplane a 
         JOIN flight f ON a.airlineID = f.support_airline AND a.tail_num = f.support_tail
         JOIN person p ON p.locationID = a.locationID 
         JOIN passenger pa ON p.personID = pa.personID
         WHERE f.flightID = ip_flightID) > 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot recycle crew: flight still has passengers.';
         LEAVE sp_main;
    END IF;
    
    SELECT a.locationID INTO arrival_loc 
         FROM airport a 
         JOIN leg l ON a.airportID = l.arrival
         WHERE l.legID = (
             SELECT legID 
             FROM route_path r 
             WHERE r.routeID = (SELECT routeID FROM flight WHERE flightID = ip_flightID)
             ORDER BY sequence DESC LIMIT 1
         );
    
    IF arrival_loc IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Arrival location not found.';
         LEAVE sp_main;
    END IF;
    
    UPDATE person 
         SET locationID = arrival_loc 
         WHERE personID IN (
             SELECT personID FROM pilot WHERE commanding_flight = ip_flightID
         );
    UPDATE pilot 
         SET commanding_flight = NULL 
         WHERE commanding_flight = ip_flightID;

END //
DELIMITER ;


-- [12] retire_flight()
-- -----------------------------------------------------------------------------
/* This stored procedure removes a flight that has ended from the system.  The
flight must be on the ground, and either be at the start its route, or at the
end of its route.  And the flight must be empty - no pilots or passengers. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS retire_flight;
DELIMITER //
CREATE PROCEDURE retire_flight (IN ip_flightID VARCHAR(50))
sp_main: BEGIN
    DECLARE f_airplane_loc VARCHAR(50);
    DECLARE f_routeID VARCHAR(50);
    DECLARE f_progress INT;
    DECLARE f_airlineID VARCHAR(50);
    DECLARE f_tail_num VARCHAR(50);
    DECLARE f_cost INT;
    
    IF ip_flightID IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Missing flight ID.';
         LEAVE sp_main;
    END IF;
    
    IF ip_flightID NOT IN (SELECT flightID FROM flight) THEN 
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight does not exist.';
         LEAVE sp_main;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM flight WHERE flightID = ip_flightID AND airplane_status LIKE 'on_ground') THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not on the ground.';
         LEAVE sp_main;
    END IF;
    
    SELECT routeID, progress, support_airline, support_tail, cost 
         INTO f_routeID, f_progress, f_airlineID, f_tail_num, f_cost 
         FROM flight WHERE flightID = ip_flightID;
    
    IF f_progress < (SELECT COUNT(*) FROM route_path WHERE routeID = f_routeID) AND f_progress <> 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not at the beginning or end of its route.';
         LEAVE sp_main;
    END IF;
    
    SELECT a.locationID INTO f_airplane_loc 
         FROM airplane a 
         JOIN flight f ON a.airlineID = f.support_airline AND a.tail_num = f.support_tail 
         WHERE f.flightID = ip_flightID;
    
    IF f_airplane_loc IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Airplane location not found.';
         LEAVE sp_main;
    END IF;
    
    IF (SELECT COUNT(*) FROM person WHERE locationID = f_airplane_loc) > 0 THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight is not empty.';
         LEAVE sp_main;
    END IF;
    
    DELETE FROM flight WHERE flightID = ip_flightID;
    
END //
DELIMITER ;

-- [13] simulation_cycle()
-- -----------------------------------------------------------------------------
/* This stored procedure executes the next step in the simulation cycle.  The flight
with the smallest next time in chronological order must be identified and selected.
If multiple flights have the same time, then flights that are landing should be
preferred over flights that are taking off.  Similarly, flights with the lowest
identifier in alphabetical order should also be preferred.

If an airplane is in flight and waiting to land, then the flight should be allowed
to land, passengers allowed to disembark, and the time advanced by one hour until
the next takeoff to allow for preparations.

If an airplane is on the ground and waiting to takeoff, then the passengers should
be allowed to board, and the time should be advanced to represent when the airplane
will land at its next location based on the leg distance and airplane speed.

If an airplane is on the ground and has reached the end of its route, then the
flight crew should be recycled to allow rest, and the flight itself should be
retired from the system. */
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS simulation_cycle;
DELIMITER //
CREATE PROCEDURE simulation_cycle ()
sp_main: BEGIN
    DECLARE next_flight VARCHAR(50);
    DECLARE f_status VARCHAR(50);
    DECLARE max_sequence INT;
    DECLARE flight_progress INT;
    
    SELECT flightID INTO next_flight
         FROM flight 
         WHERE next_time IS NOT NULL 
         ORDER BY next_time ASC,
           CASE WHEN airplane_status = 'in_flight' THEN 0 ELSE 1 END,
           flightID ASC 
         LIMIT 1;
    
    IF next_flight IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No flight to process.';
         LEAVE sp_main;
    END IF;
    
    SELECT airplane_status, progress INTO f_status, flight_progress
         FROM flight
         WHERE flightID = next_flight;
    
    IF f_status IS NULL OR flight_progress IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Flight status or progress is undefined.';
         LEAVE sp_main;
    END IF;
    
    SELECT MAX(sequence) INTO max_sequence
         FROM route_path
         WHERE routeID = (SELECT routeID FROM flight WHERE flightID = next_flight);
    
    IF max_sequence IS NULL THEN
         SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No route path defined for the flight.';
         LEAVE sp_main;
    END IF;
    
    IF f_status = 'in_flight' THEN
         CALL flight_landing(next_flight);
         CALL passengers_disembark(next_flight);
        
         SELECT progress INTO flight_progress FROM flight WHERE flightID = next_flight;
        
         IF flight_progress >= max_sequence THEN
              CALL recycle_crew(next_flight);
              CALL retire_flight(next_flight);
         END IF;
    ELSEIF f_status = 'on_ground' THEN
         IF flight_progress >= max_sequence THEN
              CALL recycle_crew(next_flight);
              CALL retire_flight(next_flight);
         ELSE
              CALL passengers_board(next_flight);
              CALL flight_takeoff(next_flight);
         END IF;
    END IF;
        
END //
DELIMITER ;


-- [14] flights_in_the_air()
-- -----------------------------------------------------------------------------
/* This view describes where flights that are currently airborne are located. 
We need to display what airports these flights are departing from, what airports 
they are arriving at, the number of flights that are flying between the 
departure and arrival airport, the list of those flights (ordered by their 
flight IDs), the earliest and latest arrival times for the destinations and the 
list of planes (by their respective flight IDs) flying these flights. */
-- -----------------------------------------------------------------------------
create or replace view flights_in_the_air (departing_from, arriving_at, num_flights,
	flight_list, earliest_arrival, latest_arrival, airplane_list) as
select
	l.departure as departing_from,
    l.arrival as arriving_at,
    count(distinct f.flightID) as num_flights,
	group_concat(distinct f.flightID order by f.flightID) as flight_list,
    min(f.next_time) as earliest_arrival,
    max(f.next_time) as latest_arrival,
    group_concat(distinct a.locationID order by f.flightID) as airplane_list
    from flight f
    join route_path rp on f.routeID = rp.routeID and f.progress = rp.sequence
    join leg l on l.legID = rp.legID
    left join airplane a on f.support_airline = a.airlineID and f.support_tail = a.tail_num
    where f.airplane_status = 'in_flight'
    group by l.departure, l.arrival;

-- [15] flights_on_the_ground()
-- ------------------------------------------------------------------------------
/* This view describes where flights that are currently on the ground are 
located. We need to display what airports these flights are departing from, how 
many flights are departing from each airport, the list of flights departing from 
each airport (ordered by their flight IDs), the earliest and latest arrival time 
amongst all of these flights at each airport, and the list of planes (by their 
respective flight IDs) that are departing from each airport.*/
-- ------------------------------------------------------------------------------
create or replace view flights_on_the_ground (departing_from, num_flights,
	flight_list, earliest_arrival, latest_arrival, airplane_list) as 
select
	case 
		when l.departure is not null then l.departure
        else l1.arrival
	end as departing_from,
    count(f.flightID) as num_flights,
    group_concat(f.flightID order by f.flightID) as flight_list,
    min(f.next_time) as earliest_arrival,
    max(f.next_time) as latest_arrival,
    group_concat(a.locationID order by f.flightID) as airplane_list
from flight f
left join route_path r on f.routeID = r.routeID and f.progress + 1 = r.sequence
left join leg l on r.legID = l.legID
left join route_path r1 on f.routeID = r1.routeID and f.progress = r1.sequence
left join leg l1 on r1.legID = l1.legID
join airplane a on a.tail_num = f.support_tail
where f.airplane_status = 'on_ground'
group by 
	case 
		when l.departure is not null then l.departure
        else l1.arrival
	end;
    
-- [16] people_in_the_air()
-- -----------------------------------------------------------------------------
/* This view describes where people who are currently airborne are located. We 
need to display what airports these people are departing from, what airports 
they are arriving at, the list of planes (by the location id) flying these 
people, the list of flights these people are on (by flight ID), the earliest 
and latest arrival times of these people, the number of these people that are 
pilots, the number of these people that are passengers, the total number of 
people on the airplane, and the list of these people by their person id. */
-- -----------------------------------------------------------------------------
create or replace view people_in_the_air (departing_from, arriving_at, num_airplanes,
	airplane_list, flight_list, earliest_arrival, latest_arrival, num_pilots,
	num_passengers, joint_pilots_passengers, person_list) as
select 
	l.departure as departing_time,
    l.arrival as arriving_at, 
    count(distinct concat(f.support_airline, f.support_tail)) as num_airplanes,
    group_concat(distinct a.locationID order by a.locationID) as airplane_list,
    group_concat(distinct f.flightID order by f.flightID) as flight_list,
    min(f.next_time) as earliest_arrival,
    max(f.next_time) as latest_arrival,
    count(distinct pil.personID) as num_pilots,
    count(distinct pas.personID) as num_passengers,
    count(distinct p.personID) as joint_pilots_passengers,
    group_concat(distinct p.personID order by p.personID) as person_list
from flight f
join route_path r on f.routeID = r.routeID and f.progress = r.sequence
join leg l on r.legID = l.legID
join airplane a on f.support_airline = a.airlineID and f.support_tail = a.tail_num
left join person p on a.locationID = p.locationID
left join pilot pil on p.personID = pil.personID and pil.commanding_flight = f.flightID
left join passenger pas on p.personID = pas.personID
where f.progress is not null and f.airplane_status = 'in_flight'
group by l.departure, l.arrival
having count(pil.personID) >= 1 and count(pas.personID) >= 1;

-- [17] people_on_the_ground()
-- -----------------------------------------------------------------------------
/* This view describes where people who are currently on the ground and in an 
airport are located. We need to display what airports these people are departing 
from by airport id, location id, and airport name, the city and state of these 
airports, the number of these people that are pilots, the number of these people 
that are passengers, the total number people at the airport, and the list of 
these people by their person id. */
-- -----------------------------------------------------------------------------
create or replace view people_on_the_ground (departing_from, airport, airport_name,
	city, state, country, num_pilots, num_passengers, joint_pilots_passengers, person_list) as
select 
	a.airportID as departing_from,
    l.locationID as airport,
    a.airport_name,
    a.city,
    a.state,
    a.country,
    count(distinct pil.personID) as num_pilots,
    count(distinct pas.personID) as num_passengers,
    count(distinct p.personID) as joint_pilots_passengers,
    group_concat(distinct p.personID order by p.personID) as person_list
from location l
join airport a on l.locationID = a.locationID
left join person p on l.locationID = p.locationID
left join pilot pil on p.personID = pil.personID
left join passenger pas on p.personID = pas.personID
where p.locationID is not null
group by a.airportID, l.locationID, a.airport_name, a.city, a.state, a.country;

-- [18] route_summary()
-- -----------------------------------------------------------------------------
/* This view will give a summary of every route. This will include the routeID, 
the number of legs per route, the legs of the route in sequence, the total 
distance of the route, the number of flights on this route, the flightIDs of 
those flights by flight ID, and the sequence of airports visited by the route. */
-- -----------------------------------------------------------------------------
create or replace view route_summary (route, num_legs, leg_sequence, route_length,
	num_flights, flight_list, airport_sequence) as
select 
	r.routeID as route, 
    count(r.legID) as num_legs,
    group_concat(r.legID order by r.sequence separator ',') as leg_sequence,
    sum(l.distance) as route_length,
    (select count(*) from flight f where f.routeID = r.routeID) as num_flights,
    (select group_concat(f.flightID order by f.flightID separator ',') from flight f where f.routeID = r.routeID) as flight_list,
	group_concat(concat(l.departure, '->', l.arrival) order by r.sequence separator ',') as airport_sequence 
from route_path r
join leg l on r.legID = l.legID
group by r.routeID;

-- [19] alternative_airports()
-- -----------------------------------------------------------------------------
/* This view displays airports that share the same city and state. It should 
specify the city, state, the number of airports shared, and the lists of the 
airport codes and airport names that are shared both by airport ID. */
-- -----------------------------------------------------------------------------
create or replace view alternative_airports (city, state, country, num_airports,
	airport_code_list, airport_name_list) as
select a.city, a.state, a.country, count(*) as num_airports, group_concat(a.airportID order by a.airportID) as airport_code_list,
	group_concat(a.airport_name order by a.airportID) as airport_name_list 
    from airport a
    group by a.city, a.state, a.country
    having count(*) > 1;
