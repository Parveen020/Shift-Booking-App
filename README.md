# Shift-Booking-App

# Setup Instructions
1. Dependencies Installation:
   # Install Frontend dependencies
    cd Frontend
    npm install

   # Install Backend dependencies
    cd Backend
    npm install
2. Data Initialization:

  · Open server.js file in the Backend folder
  · Locate and uncomment the insertMockShifts() function
  · This function performs the following tasks:
    · Deletes all existing shift data from the database
    · Inserts fresh mock shift data
    · Executes only once per day when the server starts

3. Running the Application:
   # Start Backend server
    cd Backend
    npm run server

   # Start Frontend application
    cd Frontend
    npm start
