#!/bin/bash
#
# 1. Build the node
npm run build

# 2. Check if files were actually built
ls -la dist/nodes/Moodle/
cat dist/nodes/Moodle/Moodle.node.js | grep "Version 2024.06.05.14:45"

# 3. Stop n8n completely
docker stop n8n

# 4. run/restart 
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -v $(pwd):/home/node/.n8n/custom/n8n-nodes-moodle \
  -e N8N_CUSTOM_EXTENSIONS="/home/node/.n8n/custom" \
  n8nio/n8n

# 5. Check n8n logs
docker logs -f n8n
