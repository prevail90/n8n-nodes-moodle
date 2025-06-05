#!/bin/bash
#
#
docker network create moodle-n8n-network
# Connect n8n container
docker network connect moodle-n8n-network n8n

# Connect all Moodle containers
docker network connect moodle-n8n-network moodle-docker-webserver-1
docker network connect moodle-n8n-network moodle-docker-solr-1
docker network connect moodle-n8n-network moodle-docker-mongo-1
docker network connect moodle-n8n-network moodle-docker-redis-1
docker network connect moodle-n8n-network moodle-docker-memcached0-1
docker network connect moodle-n8n-network moodle-docker-memcached1-1
docker network connect moodle-n8n-network moodle-docker-ldap-1
docker network connect moodle-n8n-network moodle-docker-selenium-1
docker network connect moodle-n8n-network moodle-docker-exttests-1
docker network connect moodle-n8n-network moodle-docker-db-1
docker network connect moodle-n8n-network moodle-docker-mailpit-1

# inspect
docker network inspect moodle-n8n-network

