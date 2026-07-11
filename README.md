
Project Title:
     SMART RENTAL BOOKING SYSTEM USING AR AND VR TECHNOLOGY (SRBS)

​PROBLEM & SOLUTION 

​PROBLEM: Manual rental housing searches in Uganda rely on unverified physical brokers, exposing tenants to high transport costs, time wasting, and widespread financial scams. Landlords face poor property visibility and inefficient paper ledger tracking.

​SOLUTION: A web platform (SRBS) featuring WebVR 360-degree virtual tours for remote property inspections, an automated landlord management dashboard, and secure deposit payment processing through the Flutterwave API gateway.

​SETUP INSTRUCTIONS 

​Prerequisites.  

​Install Node.js, MySQL Server (or XAMPP), and a modern web browser.
​Steps to Run Locally

​CLONE PROJECT: Create a folder named smart-rental-system and place the project source files inside it.
​Install Dependencies: Open your terminal in the project folder and run the command: npm install

​CONFIGURE DATABASE: Create a new database named srbs_db in your MySQL environment and import the provided database.sql schema file.
​Setup Environment: Rename the file .env.example to .env and fill in your local MySQL database login credentials and Flutterwave API test keys.
​Run System: Launch the local development server by running npm start or node server.js in your terminal.

​ACCESS APP: Open your web browser and navigate to http://localhost:3000 to test the registration, VR tours, and booking pathways.







<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d961db56-5b55-49f0-9941-3fb4bbf3f879

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
