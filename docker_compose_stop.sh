#!/bin/bash

echo "Stopping all containers defined in docker-compose.yml..."
docker-compose stop

echo "All containers have been stopped (but NOT removed)."
