# Folder Upload API Documentation

## Overview

The Folder Upload API allows you to upload entire folder structures with nested files and subfolders. The system will preserve the folder hierarchy and relationships between files and folders.

## Endpoint

```
POST /api/v2/files/upload/folder{/:resourceId}
```

Where `:resourceId` is the optional parent folder ID. If not provided, files will be uploaded to the root directory.

## Authentication

All requests must include a valid authentication token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Request Format

The request must be a `multipart/form-data` request with the following fields:

1. `files`: An array of files to upload (can include files from different folders)
2. `folderStructure`: A JSON string describing the folder structure

### Folder Structure Format

The `folderStructure` should be a JSON object where:
- Each key is the original file path (as it appears in the client's filesystem)
- Each value is an object with:
  - `path`: The target folder path where the file should be placed
  - `name`: The name of the file (without the path)

Example:

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

This structure will create:
- A folder named "folder1" in the root directory
- A subfolder named "subfolder" inside "folder1"
- Three files in their respective folders

## Example Usage

### Using cURL

```bash
curl -X POST \
  'http://your-api-url/api/v2/files/upload/folder' \
  -H 'Authorization: Bearer your_token' \
  -F 'files=@/path/to/file1.txt' \
  -F 'files=@/path/to/folder1/file2.txt' \
  -F 'files=@/path/to/folder1/subfolder/file3.txt' \
  -F 'folderStructure={
    "file1.txt": { "path": "/folder1", "name": "file1.txt" },
    "folder1/file2.txt": { "path": "/folder1", "name": "file2.txt" },
    "folder1/subfolder/file3.txt": { "path": "/folder1/subfolder", "name": "file3.txt" }
  }'
```

### Using JavaScript/Fetch API

```javascript
// Create FormData object
const formData = new FormData();

// Add files
formData.append('files', file1);
formData.append('files', file2);
formData.append('files', file3);

// Create folder structure
const folderStructure = {
  "file1.txt": { "path": "/folder1", "name": "file1.txt" },
  "folder1/file2.txt": { "path": "/folder1", "name": "file2.txt" },
  "folder1/subfolder/file3.txt": { "path": "/folder1/subfolder", "name": "file3.txt" }
};

// Add folder structure as JSON string
formData.append('folderStructure', JSON.stringify(folderStructure));

// Send request
fetch('http://your-api-url/api/v2/files/upload/folder', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_token'
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Response

A successful response will return a 200 status code with a JSON body containing:

```json
{
  "message": "Folder uploaded successfully",
  "data": {
    "folders": [
      // Array of folder objects that were created
    ],
    "files": [
      // Array of file objects that were uploaded
    ]
  }
}
```

## Error Handling

The API will return appropriate error codes and messages if something goes wrong:

- `400 Bad Request`: Missing or invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `500 Internal Server Error`: Server-side error

Error responses will include a message explaining what went wrong.

## Notes

- The system will create any folders in the path that don't already exist
- If a file or folder already exists at the target path, the API will return an error
- The maximum file size and total request size are limited by your server configuration