--Admins Table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY, 
    admin_name VARCHAR(50) NOT NULL, 
    admin_phone_no VARCHAR(20) NOT NULL, 
    admin_address TEXT NOT NULL
);

CREATE TABLE admin_login (
    admin_id INT PRIMARY KEY REFERENCES admins(admin_id) ON DELETE CASCADE,
    admin_username VARCHAR(50) UNIQUE NOT NULL, 
    admin_login_password VARCHAR(255) NOT NULL 
);

CREATE TABLE admin_logged (
    log_id SERIAL PRIMARY KEY, 
    admin_id INT REFERENCES admins(admin_id), 
    admin_loggedin_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    admin_loggedout_time TIMESTAMP
);



--NOTE: Organizer means Admin in ER-Diagram
--NOTE: adding name, phone, address, city, dob, gender column in Organizer table 
CREATE TABLE Organizer (
    organizer_id SERIAL PRIMARY KEY UNIQUE,
    organizer_name VARCHAR(100) NOT NULL,
    organizer_phone VARCHAR(15) NOT NULL,
    organizer_login_password VARCHAR(100) NOT NULL,
    organizer_address VARCHAR(255),
    organizer_city VARCHAR(100),
    organizer_dob DATE,
    organizer_gender VARCHAR(10) 
);
--ALTER TABLE organizer RENAME COLUMN organizer_password TO organizer_login_password;

--Creating separate table for multivalue attribute i.e. emails
CREATE TABLE Organizer_Emails (
    organizer_id INT,
    organizer_email VARCHAR(100),
    PRIMARY KEY (organizer_id, organizer_email),
    FOREIGN KEY (organizer_id) REFERENCES Organizer(organizer_id)
);

--NOTE: adding gender column in Users table 
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY UNIQUE,
    user_name VARCHAR(100) NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    user_address VARCHAR(255),
    user_city VARCHAR(100),
    user_dob DATE,
    user_gender VARCHAR(10)
);
--Creating separate table for multivalue attribute i.e. emails & Phone No.
CREATE TABLE Users_Emails (
    user_id INT,
    user_email VARCHAR(100),
    PRIMARY KEY (user_id, user_email),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
CREATE TABLE Users_Phone_numbers (
    user_id INT,
    user_phone_no VARCHAR(15),
    PRIMARY KEY (user_id, user_phone_no),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Rentals(
	rental_id SERIAL PRIMARY KEY,
	rental_name VARCHAR(100) NOT NULL,
	rental_cost DECIMAL(10, 2) NOT NULL,
	user_id INT REFERENCES Users(user_id)
);


CREATE TABLE Events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100),
    event_type VARCHAR(50),
    event_manager VARCHAR(100),
    no_of_attendance INT,
    event_city VARCHAR(100),
    event_amount DECIMAL(10, 2),
    event_organized_by INT REFERENCES Organizer(organizer_id)
);

--NOTE: adding address column in Venue table 
CREATE TABLE Venue(
	event_id INT REFERENCES Events(event_id),
	event_date DATE NOT NULL,
	event_timing TIME NOT NULL,
	event_address TEXT NOT NULL
);

CREATE TABLE Equipment (
    equipment_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL
);

--Event Equipment Table (Many-to-Many Relationship)
CREATE TABLE Event_Equipment (
    event_id INT,
    equipment_id INT,
    equipment_quantity INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES Events(event_id),
    FOREIGN KEY (equipment_id) REFERENCES Equipment(equipment_id),
    PRIMARY KEY (event_id, equipment_id)
);

--NOTE: adding food_description column for list of foods e.g. Roti, Chapati,jeera rice, etc.
--NOTE: prices will be depends on quantity of people(per plate) e.g. 250 Rs per plate
CREATE TABLE Food_Package (
    package_id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    people_quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    food_description TEXT NOT NULL,
    event_id INT REFERENCES Events(event_id)
);

--User Event Booking Table (Many-to-Many Relationship)
CREATE TABLE Booking (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    event_id INT REFERENCES Events(event_id),
    booking_date DATE,
    booking_time TIME, 
    venue VARCHAR(255),
    city VARCHAR(100)
);

--NOTE: adding status and amount: which will include Cost of Event, Rental, Food Package, and Equipments
CREATE TABLE Payment (
    payment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    event_id INT REFERENCES Events(event_id),
    amount DECIMAL(10, 2),
    payment_mode VARCHAR(50),
    status VARCHAR(50)
);

--NOTE: Creating 2 different table for Login Entity. user_login for USER & organizer_login for Organizer
--NOTE: excluding login_email for Login Entity to reduce the complexity.
CREATE TABLE User_Login(
    login_sr_no SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    user_login_id VARCHAR(100),
    user_login_password VARCHAR(100)
);
CREATE TABLE Organizer_Login (
    login_sr_no SERIAL PRIMARY KEY,
    organizer_id INT REFERENCES Organizer(organizer_id),
    organizer_login_id VARCHAR(100),
    organizer_login_password VARCHAR(100)
);

--Additional Table to Store The List of Events
CREATE TABLE Event_List (
    list_id SERIAL PRIMARY KEY,
    event_id INT,
    user_id INT,
    FOREIGN KEY (event_id) REFERENCES Events(event_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

