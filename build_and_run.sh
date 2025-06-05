# Build your node first
npm run build

# Run n8n with your node mounted
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -v $(pwd):/home/node/.n8n/custom/n8n-nodes-moodle \
  -e N8N_CUSTOM_EXTENSIONS="/home/node/.n8n/custom" \
  n8nio/n8n



