# Complete Moodle Permissions for n8n Node

## 🎯 **Web Service Functions to Enable**

### **Core User Functions**
```
core_user_create_users          # Create new users
core_user_get_users_by_field    # Get users by ID, email, username, etc.
core_user_update_users          # Update user information
core_user_delete_users          # Delete users
```

### **Core Course Functions**
```
core_course_create_courses      # Create new courses
core_course_get_courses         # Get all courses
core_course_get_course_by_field # Get specific course by ID/shortname
core_course_update_courses      # Update course information
core_course_delete_courses      # Delete courses
core_course_get_enrolled_users  # Get users enrolled in a course
core_course_get_categories      # Get course categories
```

### **Enrollment Functions**
```
enrol_manual_enrol_users        # Enroll users in courses
enrol_manual_unenrol_users      # Remove users from courses
core_enrol_get_users_courses    # Get courses a user is enrolled in
core_enrol_get_enrolled_users   # Get enrolled users (alternative)
```

### **Grade Functions**
```
core_grades_get_grades                    # Get user grades
gradereport_overview_get_course_grades    # Get course grade overview
core_grade_get_grade_items               # Get gradebook structure
```

### **Message Functions**
```
core_message_send_instant_messages      # Send messages to users
core_message_get_messages               # Retrieve user messages
```

### **Utility Functions**
```
core_webservice_get_site_info           # Get site information (useful for testing)
```

## 🛠️ **How to Add Functions to Your Web Service**

### **Method 1: Using Existing Service**
1. **Go to**: Site administration → Server → Web services → External services
2. **Find your service** (the one linked to your token)
3. **Click "Functions"** 
4. **Add functions** from the list above
5. **Save changes**

### **Method 2: Create New Service with All Functions**
1. **Go to**: Site administration → Server → Web services → External services
2. **Click "Add"** to create new service
3. **Service name**: `n8n Integration Service`
4. **Add all functions** from the list above
5. **Create token** for this service
6. **Update your n8n credentials** with the new token

### **Method 3: Use Mobile Web Service (Recommended)**
1. **Enable**: Site administration → Server → Web services → External services
2. **Find "Moodle mobile web service"** and enable it
3. **Create token** for this service (it includes most functions by default)
4. **Use this token** in your n8n node

## 👤 **Required User Capabilities**

The user account associated with your token needs these capabilities:

### **User Management Capabilities**
```
moodle/user:create               # Create users
moodle/user:delete               # Delete users  
moodle/user:update               # Update users
moodle/user:viewdetails          # View user details
moodle/user:viewhiddendetails    # View hidden user details
```

### **Course Management Capabilities**
```
moodle/course:create             # Create courses
moodle/course:delete             # Delete courses
moodle/course:update             # Update courses
moodle/course:view               # View courses
moodle/course:viewhiddencourses  # View hidden courses
```

### **Enrollment Capabilities**
```
enrol/manual:enrol               # Enroll users manually
enrol/manual:unenrol             # Unenroll users manually
moodle/course:enrolreview        # Review enrollments
```

### **Grade Capabilities**
```
moodle/grade:view                # View grades
moodle/grade:viewall             # View all grades
gradereport/overview:view        # View grade overview
```

### **Message Capabilities**
```
moodle/site:sendmessage          # Send messages
moodle/site:readallmessages      # Read all messages
```

### **Web Service Capabilities**
```
webservice/rest:use              # Use REST web service
moodle/webservice:createtoken    # Create tokens (if needed)
```

## 🧪 **Testing Commands**

Use these curl commands to test each function:

### **Test User Functions**
```bash
# Test user creation
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=core_user_create_users" \
-d "moodlewsrestformat=json" \
-d "users[0][username]=testuser" \
-d "users[0][password]=TestPass123!" \
-d "users[0][firstname]=Test" \
-d "users[0][lastname]=User" \
-d "users[0][email]=test@example.com"

# Test get user
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=core_user_get_users_by_field" \
-d "moodlewsrestformat=json" \
-d "field=id" \
-d "values[0]=2"
```

### **Test Course Functions**
```bash
# Test get courses
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=core_course_get_courses" \
-d "moodlewsrestformat=json"

# Test course creation
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=core_course_create_courses" \
-d "moodlewsrestformat=json" \
-d "courses[0][fullname]=Test Course" \
-d "courses[0][shortname]=TEST001" \
-d "courses[0][categoryid]=1"
```

### **Test Enrollment Functions**
```bash
# Test enrollment
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=enrol_manual_enrol_users" \
-d "moodlewsrestformat=json" \
-d "enrolments[0][userid]=2" \
-d "enrolments[0][courseid]=1" \
-d "enrolments[0][roleid]=5"
```

### **Test Grade Functions**
```bash
# Test get grades
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=core_grades_get_grades" \
-d "moodlewsrestformat=json" \
-d "userid=2"
```

### **Test Message Functions**
```bash
# Test send message
curl -X POST "http://moodle-docker-webserver-1/webservice/rest/server.php" \
-d "wstoken=YOUR_TOKEN" \
-d "wsfunction=core_message_send_instant_messages" \
-d "moodlewsrestformat=json" \
-d "messages[0][touserid]=2" \
-d "messages[0][text]=Hello from API test"
```

## 🚨 **Quick Permission Check Script**

```bash
#!/bin/bash
# Test all required functions

TOKEN="YOUR_TOKEN_HERE"
BASE_URL="http://moodle-docker-webserver-1/webservice/rest/server.php"

echo "Testing Moodle API Permissions..."

# Test functions
functions=(
    "core_webservice_get_site_info"
    "core_user_get_users_by_field"
    "core_course_get_courses"
    "core_course_get_categories"
    "core_message_send_instant_messages"
    "core_grades_get_grades"
)

for func in "${functions[@]}"; do
    echo -n "Testing $func... "
    response=$(curl -s -X POST "$BASE_URL" \
        -d "wstoken=$TOKEN" \
        -d "wsfunction=$func" \
        -d "moodlewsrestformat=json" \
        -d "field=id" \
        -d "values[0]=1" \
        -d "userid=1")
    
    if echo "$response" | grep -q "exception"; then
        echo "❌ FAILED"
        echo "   Error: $(echo "$response" | grep -o '"message":"[^"]*"')"
    else
        echo "✅ SUCCESS"
    fi
done
```

## 📋 **Permission Setup Checklist**

- [ ] **Web services enabled** in Moodle
- [ ] **REST protocol enabled**
- [ ] **All 17 functions added** to your web service
- [ ] **User has required capabilities** (or use admin account)
- [ ] **Token created and active**
- [ ] **Functions tested** with curl commands
- [ ] **n8n credentials updated** with correct token
- [ ] **All node operations working** in n8n

## 🎯 **Recommended Approach**

1. **Start with Mobile Web Service** - It has most functions enabled by default
2. **Test with curl first** - Verify each function works before using in n8n
3. **Add missing functions** - If any tests fail, add those specific functions
4. **Use admin account** - For initial setup, use an admin account to avoid capability issues
5. **Create dedicated service user** - Later, create a specific user with only required capabilities

This comprehensive list covers all functionality in your n8n Moodle node. 

The mobile web service is often the easiest starting point since it includes most functions by default.
