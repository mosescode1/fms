# File Management System (FMS)

A comprehensive file management system with support for folder hierarchies, permissions, and more.

## New Feature: Folder Upload API

The system now supports uploading entire folder structures with nested files and subfolders. This feature allows you to:

- Upload folders with their complete hierarchy
- Preserve the relationships between files and folders
- Track the folder structure in the database

### Documentation

For detailed information on how to use the Folder Upload API, see:

- [Folder Upload API Documentation](./docs/folder-upload-api.md)
- [Client-side Example](./examples/folder-upload-example.html)

### Quick Start

To upload a folder with its structure:

1. Make a `multipart/form-data` POST request to `/api/v2/files/upload/folder`
2. Include your files in the `files` field
3. Include a JSON string describing the folder structure in the `folderStructure` field

Example folder structure format:

```json
{
  "file1.txt": { 
    "path": "/folder1", 
    "name": "file1.txt" 
  },
  "folder1/file2.txt": { 
    "path": "/folder1", 
    "name": "file2.txt" 
  },
  "folder1/subfolder/file3.txt": { 
    "path": "/folder1/subfolder", 
    "name": "file3.txt" 
  }
}
```

## Features

- File and folder management
- Hierarchical folder structure
- Access control and permissions
- File versioning
- Trash and recovery
- Audit logging
- Security groups

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the database migrations: `npx prisma migrate dev`
5. Start the server: `npm start`

## API Documentation

The API is organized into versioned routes:

- V1: Core functionality
- V2: Enhanced features including folder upload

For detailed API documentation, see the [docs](./docs) directory.

## License

[MIT](LICENSE)