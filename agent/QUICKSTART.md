# Quick Start Guide - Agent Service

## ✅ Recommended: Direct Python Start

```bash
cd agent
venv\Scripts\python.exe start.py
```

This method:
- ✅ No encoding issues
- ✅ Full validation and error checking
- ✅ Shows configuration status
- ✅ Works reliably every time

---

## Alternative: Batch File

```bash
cd agent
.\run.bat
```

**Note:** The batch file now simply activates venv and runs `start.py`. All validation happens in the Python script.

---

## Troubleshooting

### "Cannot find .env file"

The `.env` file exists but might not be detected by batch scripts. Use the direct Python method instead:

```bash
venv\Scripts\python.exe start.py
```

### Check Configuration

```bash
venv\Scripts\python.exe test_config.py
```

### Verify Service is Running

```powershell
powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:5000/health').Content"
```

Expected response:
```json
{
  "status": "ok",
  "llm_ready": true
}
```

---

## Your Service Status

Based on the running processes, your service is **already running** on port 5000.

You can now use it from the TODO List frontend!
