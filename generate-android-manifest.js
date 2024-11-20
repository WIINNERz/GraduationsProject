const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Read the template file
const templatePath = path.resolve(__dirname, 'android/app/AndroidManifest.template.xml');
const template = fs.readFileSync(templatePath, 'utf8');

// Replace placeholders with environment variables
const output = template.replace(/\${GOOGLE_API_KEY}/g, process.env.GOOGLE_API_KEY);

// Write the output to AndroidManifest.xml
const outputPath = path.resolve(__dirname, 'android/app/src/main/AndroidManifest.xml');
fs.writeFileSync(outputPath, output, 'utf8');

console.log('AndroidManifest.xml has been generated successfully.');