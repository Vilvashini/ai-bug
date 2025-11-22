# AI Bug Tracker — Smart Debug Assistant

An intelligent web application that accepts and analyzes error logs using AI. The system automatically detects and redacts sensitive information, leverages OpenAI to explain root causes, categorize issues, suggest fixes, and estimate severity. Built with deduplication and caching to avoid reprocessing similar logs.

## Features

- **Log Upload & Parsing**: Accept .log, .txt, or .json files (max 5MB) with drag-and-drop support
- **Sensitive Data Redaction**: Automatically redact file paths, IPs, usernames, API keys, URLs, emails, and timestamps before sending to AI
- **Intelligent Deduplication**: Detect exact duplicates using SHA-256 hashing
- **Smart Caching**: Reuse cached AI results for similar logs using Jaccard similarity algorithm (configurable threshold)
- **AI Analysis**: Leverage OpenAI GPT-4o to provide:
  - Issue Type classification
  - Root Cause explanation
  - Suggested Fix recommendations
  - Severity Rating (Critical, High, Medium, Low)
- **Dashboard & History**: View all uploaded logs with metadata (filename, size, upload time, status, severity)
- **Responsive UI**: Modern, clean interface with real-time feedback

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Web server
- **SQLite3** - Local database
- **Multer** - File upload handling
- **OpenAI API** - AI integration
- **Crypto** - SHA-256 hashing

### Database Schema
- `logs` table: Stores uploaded files with metadata (hash, redacted content, status)
- `analyses` table: Stores AI analysis results
- `cache` table: Manages similarity caching

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key (https://platform.openai.com/account/api-keys)

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory with the following:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=4000
CLIENT_URL=http://localhost:5173
MAX_UPLOAD_SIZE_BYTES=5242880
SIMILARITY_THRESHOLD=0.8
```

**Important Security Notes:**
- **Never commit `.env` file to version control** - use `.gitignore` to exclude it
- **Keep your OpenAI API key private** - treat it like a password
- Use environment variables (as shown above) to pass secrets, not hardcoded values
- The backend validates and sanitizes file uploads before processing

### 3. Initialize the Database

```bash
cd backend
npm run initdb
```

This creates the SQLite database with required tables (`logs`, `analyses`, `cache`).

### 4. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
# Server will run at http://localhost:4000
```

**Terminal 2 - Frontend Dev Server:**
```bash
cd frontend
npm run dev
# App will run at http://localhost:5173
```

The application should now be accessible at `http://localhost:5173`

## API Endpoints

### Upload & Analyze Log
**POST** `/upload`
- Accepts multipart form data with a single file
- Automatically redacts sensitive data
- Checks for exact duplicates and similar logs
- Calls OpenAI for analysis if not cached
- Returns: `{ status, log, analysis, similarity }`

### Get Upload History
**GET** `/history`
- Returns all uploaded logs with analysis metadata
- Limited to 200 most recent entries
- Sorted by upload time (newest first)

### Get Specific Log Details
**GET** `/log/:id`
- Returns full log and analysis details for a specific log ID

### Health Check
**GET** `/`
- Returns: `{ ok: true, time: <timestamp> }`

## Redaction Rules

The system automatically redacts the following sensitive data before sending to OpenAI:

| Data Type | Pattern | Replacement |
|-----------|---------|------------|
| IP Addresses | `\b\d{1,3}(?:\.\d{1,3}){3}\b` | `[REDACTED:IP]` |
| API Keys | `\b[A-Fa-f0-9]{32,}\b` | `[REDACTED:KEY]` |
| URLs | `https?:\/\/[^\s)"]+` | `[REDACTED:URL]` |
| Emails | `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}` | `[REDACTED:EMAIL]` |
| Timestamps | `\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}` | `[REDACTED:TS]` |
| File Paths | Windows: `[A-Za-z]:\\...`, Unix: `/[^\s\n]*` | `[REDACTED:PATH]` |
| Usernames | `user(name)?[:=]\s*\w+` | `[REDACTED:USER]` |
| Long Tokens | `\b[A-Za-z0-9_\-]{20,}\b` | `[REDACTED:API_KEY]` |

**Note**: The original file is deleted after processing; only the redacted version is stored.

## Caching & Deduplication Strategy

### Exact Duplicates
- Compares SHA-256 hash of incoming log with all stored logs
- If match found, returns the previous analysis immediately
- No OpenAI call is made

### Similarity-Based Caching
- Uses Jaccard similarity algorithm on tokenized log content
- Compares against last 100 logs in database
- If similarity score >= `SIMILARITY_THRESHOLD` (default 0.8):
  - Reuses the cached analysis
  - Saves API calls and reduces latency
  - Returns similarity score for transparency
- Configurable via `SIMILARITY_THRESHOLD` environment variable

### Cost Savings
- Reduces OpenAI API calls for repeated/similar issues
- Each analysis is relatively expensive; caching provides significant savings
- Monitor database size; older logs can be archived if needed

## File Upload Validation

The backend enforces strict validation:

1. **File Type**: Only `.log`, `.txt`, and `.json` files allowed
2. **File Size**: Maximum 5MB (configurable via `MAX_UPLOAD_SIZE_BYTES`)
3. **Content Validation**: Ensures file is readable text
4. **Empty File Check**: Rejects files with no content

The frontend also validates before upload to provide immediate user feedback.

## Database Management

### View Database Contents
```bash
# Using sqlite3 CLI
sqlite3 backend/bugtracker.db

# Common queries:
SELECT * FROM logs LIMIT 10;
SELECT l.*, a.* FROM logs l LEFT JOIN analyses a ON a.log_id = l.id;
```

### Reset Database
```bash
# Delete the database file (this will be recreated)
rm backend/bugtracker.db

# Re-initialize
cd backend && npm run initdb
```

### Backup Database
```bash
cp backend/bugtracker.db backend/bugtracker.db.backup
```

## Project Structure

```
├── backend/
│   ├── routes/
│   │   ├── upload.js      # File upload, redaction, analysis, caching
│   │   ├── history.js     # Retrieve upload history and details
│   │   └── test.js        # OpenAI connectivity test
│   ├── utils/
│   │   ├── redact.js      # Sensitive data redaction patterns
│   │   ├── hash.js        # SHA-256 hashing for deduplication
│   │   └── similarity.js  # Jaccard similarity for caching
│   ├── db.js              # SQLite database wrapper
│   ├── db_init.js         # Database initialization script
│   ├── server.js          # Express app setup
│   ├── uploads/           # Temporary uploaded files (deleted after processing)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadBox.jsx      # File upload with drag-and-drop
│   │   │   ├── LogPreview.jsx     # Display analysis results
│   │   │   └── HistoryTable.jsx   # Upload history table
│   │   ├── api.js                 # API client (axios)
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── package.json
│
└── README.md
```

## Security Best Practices

### API Key Management
✅ **DO:**
- Store `OPENAI_API_KEY` in `.env` file only
- Add `.env` to `.gitignore`
- Use environment variables for deployment
- Rotate keys periodically
- Use API key restrictions (IP whitelist, model limits) in OpenAI dashboard

❌ **DON'T:**
- Commit `.env` files to version control
- Log API keys in console/error messages
- Expose API keys in frontend code
- Share API keys via email or chat

### File Handling
- All uploaded files are validated (type, size, content)
- Files are automatically deleted after processing
- Only redacted content is stored in the database
- No sensitive data stored persistently

### Data Privacy
- Redaction happens before AI processing
- Original files are not sent to OpenAI
- Stored logs contain only sanitized information
- Database should be encrypted at rest in production

### Deployment Recommendations
1. Use HTTPS in production
2. Implement rate limiting on upload endpoint
3. Add authentication/authorization for admin access
4. Use production-grade database (PostgreSQL, MySQL)
5. Enable database backups and disaster recovery
6. Monitor API usage and costs
7. Implement request logging for audit trails
8. Use secrets management (HashiCorp Vault, AWS Secrets Manager)

## Troubleshooting

### OpenAI API Key Not Set
**Error**: `❌ OPENAI_API_KEY not set in .env`
**Solution**: 
1. Verify `.env` file exists in `backend/` directory
2. Confirm `OPENAI_API_KEY=sk-...` is set
3. Restart backend server

### Port Already in Use
**Error**: `EADDRINUSE: address already in use :::4000`
**Solution**: 
1. Change `PORT` in `.env` to available port (e.g., 5000)
2. Or kill process: `lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9`

### Database Locked
**Error**: `database is locked`
**Solution**: 
1. Ensure only one instance of backend is running
2. Close any open SQLite connections
3. Delete `bugtracker.db` and reinitialize if stuck

### CORS Errors in Browser
**Error**: `Access to XMLHttpRequest blocked by CORS policy`
**Solution**: 
1. Verify backend server is running
2. Check `CLIENT_URL` matches frontend URL in `.env`
3. Ensure backend has CORS middleware enabled

### File Upload Size Limit
**Error**: `File size exceeds 5MB limit`
**Solution**: 
1. Reduce file size or split into smaller chunks
2. Increase `MAX_UPLOAD_SIZE_BYTES` in `.env` (not recommended)
3. Pre-compress or filter logs before uploading

## Performance Considerations

### Optimization Tips
1. **Caching**: Leverage similarity caching to avoid redundant API calls
2. **Batch Processing**: Upload logs in batches if processing many files
3. **Database Indexing**: As logs table grows, add indexes on `hash` and `upload_time`
4. **Cleanup Old Logs**: Periodically archive or delete old logs to optimize queries

### Monitoring
- Track API costs in OpenAI dashboard
- Monitor database size growth
- Log processing times for performance analysis
- Set up alerts for failed uploads

## Development Guidelines

### Code Structure
- **Routes**: Handle HTTP requests and responses
- **Utils**: Reusable functions (redaction, hashing, similarity)
- **Components**: React UI components with embedded styles
- **Styles**: Tailwind CSS with inline CSS for component-specific styles

### Adding New Features
1. Update database schema if needed (modify `db_init.js`)
2. Add API endpoints in `backend/routes/`
3. Create frontend components in `frontend/src/components/`
4. Update API client in `frontend/src/api.js`
5. Test thoroughly before merging

### Testing the Upload Flow
```bash
# Test endpoint directly
curl -X GET http://localhost:4000/test

# Check database
sqlite3 backend/bugtracker.db "SELECT * FROM logs LIMIT 5;"
```

## Known Limitations & Future Enhancements

### Current Limitations
- Single-threaded backend (use load balancer for scaling)
- SQLite not suitable for high-concurrency (migrate to PostgreSQL)
- No authentication/authorization implemented
- No support for multi-file batch uploads
- Limited to text-based logs (no binary log parsing)

### Future Enhancements
1. User authentication and authorization
2. Advanced filtering and search in history
3. Custom redaction rule configuration
4. Batch upload support
5. Export analysis results (PDF, CSV)
6. Webhook notifications for analysis completion
7. Machine learning for improved categorization
8. Support for structured log formats (JSON parsing)
9. Real-time log streaming
10. Admin dashboard with usage analytics

## License

This project is provided as-is for educational and commercial purposes.

## Support & Contact

For issues, questions, or suggestions:
1. Check the Troubleshooting section above
2. Review environment variable configuration
3. Check backend server logs for errors
4. Verify OpenAI API key is valid and has sufficient credits

## Version History

**v1.0.0** - Initial release
- Core file upload functionality
- Sensitive data redaction
- OpenAI integration
- Deduplication and similarity caching
- Upload history dashboard
- Responsive UI with drag-and-drop

---

**Happy debugging! 🚀**
