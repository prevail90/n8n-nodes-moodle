# How to Import Moodle Workflows into n8n

## 📋 **Step-by-Step Import Process**

### 1. **Copy the Workflow JSON**
- Select one of the workflow JSONs (Workflow 1, 2, or 3)
- Copy the entire JSON content (from opening `{` to closing `}`)

### 2. **Import into n8n**
1. Open your n8n interface
2. Click **"+ Add workflow"** or the **"Import from file"** button
3. Choose **"Import from clipboard"** 
4. Paste the JSON content
5. Click **"Import"**

### 3. **Configure Credentials**
After import, you'll need to:
1. Click on any Moodle node (they'll show red/error state)
2. Set up your **Moodle API credentials**:
   - **URL**: `http://moodle-docker-webserver-1` (or your Moodle URL)
   - **Token**: Your Moodle web service token
3. Save the credentials

### 4. **Test the Workflow**
1. Click **"Execute workflow"** on the Manual Trigger
2. Check if nodes execute successfully (green checkmarks)

## 🛠️ **If Import Fails**

### **Option A: Manual Recreation**
If the JSON import doesn't work, recreate manually:

1. **Create New Workflow**
2. **Add Manual Trigger node**
3. **Add Moodle nodes**:
   - Set Resource (User, Course, Enrollment, Message, Grade)
   - Set Operation (Get, Create, Send, etc.)
   - Configure parameters

### **Option B: Simple Test Workflow**
Create this minimal test first:

```
Manual Trigger → Moodle (User: Get, User ID: 2)
```

This tests if your Moodle node is working at all.

### **Option C: Check Node Type**
The Moodle node type might be registered differently. Try these variations in the JSON:
- `"type": "moodle"`
- `"type": "n8n-nodes-moodle.moodle"`  
- `"type": "@types/moodle"`

## 🔧 **Troubleshooting Common Issues**

| Issue | Solution |
|-------|----------|
| **"Node type not found"** | Ensure your Moodle node is properly installed and n8n restarted |
| **"Credentials required"** | Set up Moodle API credentials with correct URL and token |
| **"Function not allowed"** | Check Moodle web service permissions for required functions |
| **Import fails completely** | Use manual recreation approach instead |

## 🎯 **Recommended Testing Order**

1. **Start with Workflow 2** (Simple Test) - Tests basic User and Course operations
2. **Then try Workflow 3** (Message Test) - Tests messaging and enrollment
3. **Finally Workflow 1** (Full Automation) - Complete enrollment workflow

## 📝 **Manual Workflow Creation Template**

If automatic import fails, here's the simplest manual setup:

### **Basic Test Workflow:**
1. **Manual Trigger** 
   - No configuration needed

2. **Moodle Node**
   - Resource: `User`
   - Operation: `Get`
   - User ID: `2`
   - Credentials: Your Moodle API

### **Message Test Workflow:**
1. **Manual Trigger**

2. **Moodle Node** 
   - Resource: `Message`
   - Operation: `Send`
   - To User ID: `2`
   - Message Text: `"Hello from n8n!"`

## ✅ **Success Indicators**

You'll know it's working when:
- ✅ Nodes show **green checkmarks** after execution
- ✅ **Output data** appears in the node results
- ✅ **User receives message** in Moodle (for message tests)
- ✅ **No red error indicators** on nodes

## 🆘 **If Nothing Works**

Contact me with:
1. **Error messages** from n8n console
2. **Node configuration** screenshots  
3. **n8n version** you're using
4. **Workflow JSON** that you tried to import

The workflows above should work, but n8n's import format can be sensitive to version differences and node registration.
