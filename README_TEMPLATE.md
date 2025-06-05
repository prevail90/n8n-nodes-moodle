![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-moodle

This is an n8n community node. It lets you use Moodle functions in your n8n workflows.

Moodle is a widely used open-source learning management system (LMS) designed to help educators create and manage online courses. It provides tools for delivering content, facilitating communication, tracking progress, and assessing learners in both academic and corporate environments.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

#### Core Functions (17 total)
User Management (4 functions):

core_user_create_users
core_user_get_users_by_field
core_user_update_users
core_user_delete_users

#### Course Management (7 functions):

core_course_create_courses
core_course_get_courses
core_course_get_course_by_field
core_course_update_courses
core_course_delete_courses
core_course_get_enrolled_users
core_course_get_categories

#### Enrollment Management (4 functions):

enrol_manual_enrol_users
enrol_manual_unenrol_users
core_enrol_get_users_courses
core_enrol_get_enrolled_users

#### Grade Management (3 functions):

core_grades_get_grades
gradereport_overview_get_course_grades
core_grade_get_grade_items

#### Messaging (2 functions):

core_message_send_instant_messages
core_message_get_messages

#### Utility (1 function):

core_webservice_get_site_info

## Credentials

Define the Moodle URL (e.g. https://moodle.mytraininginstitude.com) and Web Service Token (e.g. fa7b23c91e1f4b408e5d2a79b467ec31) Web Service Token can be created at Moodle side, visiting Site Administration -> Server -> Manage Tokens

## Compatibility

Tested versions: n8n v 1.95.3 Moodle 5.1dev (Build: 20250530)

## Usage

_This is an optional section. Use it to help users with any difficult or confusing aspects of the node._

_By the time users are looking for community nodes, they probably already know n8n basics. But if you expect new users, you can link to the [Try it out](https://docs.n8n.io/try-it-out/) documentation to help them get started._

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Moodle Dev API Guides](https://moodledev.io/docs/5.1/apis)

## Credits

This project was developed collaboratively with assistance from Claude (Anthropic's AI assistant) for:
- API integration architecture and HTTP request formatting
- Comprehensive workflow design and use case implementation
- Docker networking solutions and debugging approaches
- Moodle API parameter formatting and error handling

The development involved extensive problem-solving, testing, and iterative improvements 
to create a production-ready Moodle integration for n8n.
