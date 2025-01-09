#!/bin/bash

# Check if the Docker image 'gallery-fun' exists
if [[ "$(docker images -q gallery-fun 2>/dev/null)" != "" ]]; then
  echo "Removing existing image 'gallery-fun'..."
  docker rmi -f gallery-fun
fi

echo "Building the image 'gallery-fun'..."
docker build -t gallery-fun .

echo "Removing existing container 'gallery-fun'..."
docker rm -f gallery-fun

# Run the Docker container with port mapping
docker run -d \
  --name gallery-fun \
  -p 3888:3000 \
  gallery-fun
