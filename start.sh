#!/bin/bash

# Wait for MongoDB to be ready
echo "Waiting for MongoDB connection..."
sleep 10

# Navigate to Backend directory and start the application  
echo "Starting application..."
cd Backend && npm start 