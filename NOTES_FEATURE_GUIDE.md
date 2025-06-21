# Notes Feature Guide

## 📝 Overview

The Notes feature allows users to create, manage, and organize personal notes within the Life OS application. This guide explains how the feature works, how to use it, and how it integrates with the existing system.

## 🗄️ Database Schema

### Note Model Structure

```prisma
model Note {
  id          String   @id @default(uuid())
  title       String
  content     String
  tags        String?  // JSON array of tags
  isPinned    Boolean  @default(false)
  isArchived  Boolean  @default(false)
  color       String?  // For color coding
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("notes")
}
```

### Field Descriptions

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `id` | String | Unique identifier | Auto-generated UUID |
| `title` | String | Note title | Required |
| `content` | String | Note content/body | Required |
| `tags` | String? | JSON array of tags | Optional |
| `isPinned` | Boolean | Pin note to top | false |
| `isArchived` | Boolean | Archive note | false |
| `color` | String? | Color code for note | Optional |
| `userId` | String | User who owns the note | Required |
| `createdAt` | DateTime | Creation timestamp | Auto-generated |
| `updatedAt` | DateTime | Last update timestamp | Auto-updated |

## 🔌 API Endpoints

### 1. Get All Notes
```http
GET /api/notes?userId={userId}
```

**Response:**
```json
[
  {
    "id": "note-uuid",
    "title": "Meeting Notes",
    "content": "Discuss project timeline...",
    "tags": "[\"work\", \"meeting\"]",
    "isPinned": true,
    "isArchived": false,
    "color": "#FF6B6B",
    "userId": "user-uuid",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

### 2. Create New Note
```http
POST /api/notes
Content-Type: application/json

{
  "title": "New Note",
  "content": "Note content here...",
  "tags": ["personal", "ideas"],
  "color": "#4ECDC4",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "id": "new-note-uuid",
  "title": "New Note",
  "content": "Note content here...",
  "tags": "[\"personal\", \"ideas\"]",
  "isPinned": false,
  "isArchived": false,
  "color": "#4ECDC4",
  "userId": "user-uuid",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### 3. Get Specific Note
```http
GET /api/notes/{noteId}
```

### 4. Update Note
```http
PUT /api/notes/{noteId}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["updated", "tags"],
  "isPinned": true,
  "isArchived": false,
  "color": "#45B7D1"
}
```

### 5. Delete Note
```http
DELETE /api/notes/{noteId}
```

**Response:**
```json
{
  "message": "Note deleted successfully"
}
```

## 🚀 Usage Examples

### JavaScript/TypeScript Examples

#### 1. Fetch All Notes
```javascript
const fetchNotes = async (userId) => {
  try {
    const response = await fetch(`/api/notes?userId=${userId}`);
    const notes = await response.json();
    return notes;
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};
```

#### 2. Create New Note
```javascript
const createNote = async (noteData) => {
  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });
    const newNote = await response.json();
    return newNote;
  } catch (error) {
    console.error('Error creating note:', error);
  }
};

// Usage
const newNote = await createNote({
  title: 'My New Note',
  content: 'This is the content of my note',
  tags: ['personal', 'ideas'],
  color: '#FF6B6B',
  userId: 'user-uuid'
});
```

#### 3. Update Note
```javascript
const updateNote = async (noteId, updates) => {
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const updatedNote = await response.json();
    return updatedNote;
  } catch (error) {
    console.error('Error updating note:', error);
  }
};
```

#### 4. Delete Note
```javascript
const deleteNote = async (noteId) => {
  try {
    const response = await fetch(`/api/notes/${noteId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};
```

### React Component Example

```jsx
import { useState, useEffect } from 'react';

const NotesComponent = ({ userId }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes?userId=${userId}`);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteData, userId }),
      });
      const newNote = await response.json();
      setNotes(prev => [newNote, ...prev]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  if (loading) return <div>Loading notes...</div>;

  return (
    <div>
      <h2>My Notes</h2>
      {notes.map(note => (
        <div key={note.id} style={{ border: `2px solid ${note.color || '#ccc'}` }}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          {note.isPinned && <span>📌 Pinned</span>}
          {note.tags && (
            <div>
              {JSON.parse(note.tags).map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

## 🎨 Feature Capabilities

### 1. Note Organization
- **Pinning**: Pin important notes to the top
- **Archiving**: Archive old notes instead of deleting
- **Color Coding**: Assign colors to categorize notes
- **Tags**: Add multiple tags for easy searching

### 2. Sorting & Filtering
Notes are automatically sorted by:
1. **Pinned notes first** (pinned notes appear at top)
2. **Most recently updated** (newest first)

### 3. Data Persistence
- Notes are stored in PostgreSQL database
- Automatic timestamps for creation and updates
- Soft deletion through archiving

## 🔧 Implementation Details

### Database Migration
```bash
# The migration was created automatically when we added the Note model
npx prisma migrate dev --name add_notes
```

### API Route Structure
```
app/api/notes/
├── route.ts          # GET (all notes), POST (create note)
└── [id]/
    └── route.ts      # GET, PUT, DELETE (single note)
```

### Error Handling
All API endpoints include comprehensive error handling:
- **400**: Bad request (missing required fields)
- **404**: Note not found
- **500**: Server error

## 🚨 Troubleshooting

### Common Issues

#### 1. Foreign Key Constraint Error
```
Error: Foreign key constraint violated on the constraint: `notes_userId_fkey`
```

**Solution:** Ensure the `userId` exists in the users table before creating a note.

```javascript
// Check if user exists first
const user = await prisma.user.findUnique({
  where: { id: userId }
});

if (!user) {
  return NextResponse.json(
    { error: 'User not found' },
    { status: 404 }
  );
}
```

#### 2. Invalid JSON in Tags
```
Error: Invalid JSON format in tags field
```

**Solution:** Ensure tags are properly formatted as JSON array.

```javascript
// Correct format
const tags = JSON.stringify(['tag1', 'tag2']);

// In API
tags: tags ? JSON.stringify(tags) : null
```

#### 3. Missing Required Fields
```
Error: Title, content, and userId are required
```

**Solution:** Always provide required fields when creating notes.

```javascript
const noteData = {
  title: 'Note Title',      // Required
  content: 'Note content',  // Required
  userId: 'user-uuid'       // Required
};
```

### Testing the API

#### 1. Using curl
```bash
# Get all notes
curl "http://localhost:3001/api/notes?userId=your-user-id"

# Create a note
curl -X POST http://localhost:3001/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note",
    "userId": "your-user-id"
  }'
```

#### 2. Using Postman
- Import the API endpoints
- Set up environment variables for `userId`
- Test each endpoint with sample data

#### 3. Using Browser Developer Tools
```javascript
// In browser console
fetch('/api/notes?userId=your-user-id')
  .then(response => response.json())
  .then(notes => console.log(notes));
```

## 📊 Database Queries

### Useful SQL Queries for DBeaver

#### 1. View All Notes
```sql
SELECT * FROM notes ORDER BY "isPinned" DESC, "updatedAt" DESC;
```

#### 2. Notes by User
```sql
SELECT n.*, u.name as user_name 
FROM notes n 
JOIN users u ON n."userId" = u.id 
WHERE u.id = 'user-uuid';
```

#### 3. Pinned Notes
```sql
SELECT * FROM notes WHERE "isPinned" = true;
```

#### 4. Notes with Tags
```sql
SELECT * FROM notes WHERE tags IS NOT NULL;
```

#### 5. Recent Notes
```sql
SELECT * FROM notes 
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC;
```

## 🎯 Best Practices

### 1. Frontend Implementation
- **Lazy Loading**: Load notes in batches for better performance
- **Search & Filter**: Implement client-side search for tags and content
- **Real-time Updates**: Use WebSocket or polling for live updates
- **Optimistic Updates**: Update UI immediately, sync with server

### 2. Data Management
- **Validation**: Always validate input on both client and server
- **Sanitization**: Clean user input to prevent XSS
- **Rate Limiting**: Implement API rate limiting for production
- **Caching**: Cache frequently accessed notes

### 3. User Experience
- **Auto-save**: Save notes automatically as user types
- **Keyboard Shortcuts**: Add shortcuts for common actions
- **Drag & Drop**: Allow reordering of notes
- **Rich Text**: Consider rich text editor for content

## 🔮 Future Enhancements

### Potential Features
1. **Rich Text Editor**: Support for formatting, images, links
2. **Note Templates**: Pre-defined templates for common note types
3. **Collaboration**: Share notes with other users
4. **Version History**: Track changes and revert to previous versions
5. **Search**: Full-text search across all notes
6. **Export**: Export notes to PDF, Markdown, or other formats
7. **Attachments**: Support for file attachments
8. **Reminders**: Set reminders for important notes

### Technical Improvements
1. **Pagination**: Handle large numbers of notes efficiently
2. **Full-text Search**: Implement PostgreSQL full-text search
3. **Real-time Sync**: WebSocket integration for live updates
4. **Offline Support**: Service worker for offline note editing
5. **Mobile Optimization**: Touch-friendly interface

## 📚 Related Documentation

- [Local Database Integration Guide](./LOCAL_DATABASE_INTEGRATION.md)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎉 Notes Feature Complete!

The Notes feature is now fully integrated into your Life OS application:

- ✅ **Database Schema**: Note model with all necessary fields
- ✅ **API Endpoints**: Complete CRUD operations
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Documentation**: Complete usage guide and examples
- ✅ **Testing**: Ready for frontend integration

You can now create, read, update, and delete notes through the API, and the feature is ready for frontend implementation! 🚀 