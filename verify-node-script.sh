#!/bin/bash

echo "🔍 Verifying Moodle Node Update..."

# Check if build succeeded
if [ -f "dist/nodes/Moodle/Moodle.node.js" ]; then
    echo "✅ Built file exists"
    
    # Check if our version identifier is in the built file
    if grep -q "v2024.06.05.14:45" dist/nodes/Moodle/Moodle.node.js; then
        echo "✅ Version identifier found in built file"
    else
        echo "❌ Version identifier NOT found in built file"
    fi
else
    echo "❌ Built file does not exist - run 'npm run build'"
    exit 1
fi

# Check if n8n container is running
if docker ps | grep -q "n8n"; then
    echo "✅ n8n container is running"
    
    # Check if custom node exists in container
    if docker exec n8n test -f /home/node/.n8n/custom/n8n-nodes-moodle/dist/nodes/Moodle/Moodle.node.js; then
        echo "✅ Custom node file exists in n8n container"
        
        # Check if version is in the container file
        if docker exec n8n grep -q "v2024.06.05.14:45" /home/node/.n8n/custom/n8n-nodes-moodle/dist/nodes/Moodle/Moodle.node.js; then
            echo "✅ Latest version is in n8n container"
        else
            echo "❌ Old version in n8n container - need to copy latest files"
        fi
    else
        echo "❌ Custom node not found in n8n container"
    fi
else
    echo "❌ n8n container is not running"
fi

echo ""
echo "📋 Recommended actions:"
echo "1. Run: npm run build"
echo "2. Copy files to n8n container"
echo "3. Restart n8n: docker restart n8n"
echo "4. Check n8n logs: docker logs -f n8n"
echo "5. Refresh browser and look for version (v2024.06.05.14:45) in node description"