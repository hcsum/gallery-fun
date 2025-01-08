#!/bin/bash

# Check if the Docker image 'gallery-fun' exists
if [[ "$(docker images -q gallery-fun 2>/dev/null)" == "" ]]; then
  echo "Image 'gallery-fun' does not exist. Building the image..."
  docker build -t gallery-fun .
else
  echo "Image 'gallery-fun' already exists. Skipping build."
fi

# Run the Docker container with port mapping
docker run -d \
  --name gallery-fun \
  -p 3888:3000 \
  gallery-fun
