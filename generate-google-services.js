const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Read the template file
const templatePath = path.resolve(__dirname, 'android/app/google-services.template.json');
const template = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders with environment variables
const output = template.replace(/\${FIREBASE_API_KEY}/g, process.env.FIREBASE_API_KEY);

// Write the output to google-services.json
const outputPath = path.resolve(__dirname, 'android/app/google-services.json');
fs.writeFileSync(outputPath, output, 'utf8');

console.log('google-services.json has been generated successfully.');