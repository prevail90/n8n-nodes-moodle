Setting up the MoodleHQ moodle-docker environment step by step.

## **Prerequisites**

First, ensure you have:

- Docker v20.10.15+ and Docker Compose v2.5.0+ installed 
- 3.25GB of RAM if using Microsoft SQL Server (less for other databases)
- Git installed

```
git clone https://github.com/moodlehq/moodle-docker.git
cd moodle-docker
```

**2. Set up environment variables**

```
# Set the path where you want Moodle code (or where it already exists)
export MOODLE_DOCKER_WWWROOT=./moodle

# Choose your database (pgsql, mariadb, mysql, mssql, oracle)
export MOODLE_DOCKER_DB=pgsql

# Optional: Set PHP version (default is 8.2)
export MOODLE_DOCKER_PHP_VERSION=8.2

# Optional: Set custom web port if 8000 is taken
export MOODLE_DOCKER_WEB_PORT=8000
```

### **3. Get Moodle code**

If you don't already have Moodle code:

```
git clone -b main https://github.com/moodle/moodle moodle
```

**4. Configure Moodle for Docker**

```
# Copy the Docker-specific config template
cp config.docker-template.php $MOODLE_DOCKER_WWWROOT/config.php
```

**5. Start the containers**

```
# Install Moodle database
bin/moodle-docker-compose exec webserver php admin/cli/install_database.php \
  --agree-license \
  --fullname="Docker Moodle Test" \
  --shortname="docker_test" \
  --summary="Moodle testing environment" \
  --adminpass="test" \
  --adminemail="admin@example.com"
```


## **Access Your Moodle Site**

- **Moodle site:** [http://localhost:8000/](http://localhost:8000/)
- **Admin login:** username `admin`, password `test`
- **Email testing:** [http://localhost:8000/_/mail](http://localhost:8000/_/mail) (Mailpit interface to view emails) [GitHub - moodlehq/moodle-docker: A docker environment for moodle developers](https://github.com/moodlehq/moodle-docker)

```
# Stop containers (keeps data)
bin/moodle-docker-compose stop

# Start stopped containers
bin/moodle-docker-compose start

# Stop and destroy containers (loses data)
bin/moodle-docker-compose down
```


**Running tests:**

```
# Initialize PHPUnit
bin/moodle-docker-compose exec webserver php admin/tool/phpunit/cli/init.php

# Run PHPUnit tests
bin/moodle-docker-compose exec webserver vendor/bin/phpunit [test_file]

# Initialize Behat
bin/moodle-docker-compose exec webserver php admin/tool/behat/cli/init.php

# Run Behat tests
bin/moodle-docker-compose exec -u www-data webserver php admin/tool/behat/cli/run.php --tags=@auth_manual
```


### **Multiple Moodle instances:**

If you want to run multiple versions simultaneously:

```
# Set a unique project name
export COMPOSE_PROJECT_NAME=moodle34
export MOODLE_DOCKER_WEB_PORT=8001
# Then run the setup steps again
```


## **Advanced Configuration**

### **Enable external services for testing:**

```
export MOODLE_DOCKER_PHPUNIT_EXTERNAL_SERVICES=1
# This adds memcached, redis, solr, and openldap dependencies
```

**Add XDebug for debugging:**

```
# Install XDebug
bin/moodle-docker-compose exec webserver pecl install xdebug

# Configure XDebug
bin/moodle-docker-compose exec webserver bash -c 'echo "
xdebug.mode = debug
xdebug.client_host = host.docker.internal
" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini'

# Enable and restart
bin/moodle-docker-compose exec webserver docker-php-ext-enable xdebug
bin/moodle-docker-compose restart webserver
```


## **Troubleshooting Tips**

1. **Port conflicts:** Change `MOODLE_DOCKER_WEB_PORT` if 8000 is in use
2. **Permission issues:** Make sure your user is in the docker group
3. **Session issues:** Clear all cookies for localhost if you're being logged off continuously [GitHub - moodlehq/moodle-docker: A docker environment for moodle developers](https://github.com/moodlehq/moodle-docker)

This setup gives you a full Moodle testing environment with all supported database servers, Behat/Selenium configuration, and all PHP extensions enabled [GitHub - moodlehq/moodle-docker: A docker environment for moodle developers](https://github.com/moodlehq/moodle-docker)
