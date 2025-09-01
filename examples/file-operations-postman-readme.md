# File Operations Postman Collection

This Postman collection provides a set of API requests for testing file and folder operations in the File Management System, including moving, copying, and renaming files and folders.

## Getting Started

### Prerequisites

- [Postman](https://www.postman.com/downloads/) installed on your machine
- File Management System running locally or on a server

### Importing the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Select "File" and choose the `file-operations-postman-collection.json` file
4. Click "Import"

## Collection Structure

The collection is organized into the following folders:

1. **Authentication** - Endpoints for logging in and getting an authentication token
   - Admin Login
   - User Login

2. **Move Operations** - Endpoints for moving files and folders
   - Move File
   - Move Folder

3. **Copy Operations** - Endpoints for copying files and folders
   - Copy File
   - Copy Folder

4. **Rename Operations** - Endpoints for renaming files and folders
   - Rename File
   - Rename Folder

## Using the Collection

### Setting Up Variables

Before using the collection, you need to set up the following variables:

1. `baseUrl` - The base URL of your API (default: http://localhost:3000)
2. `authToken` - The authentication token received after login
3. `fileId` - The ID of the file you want to operate on
4. `folderId` - The ID of the folder you want to operate on

### Authentication

1. Use either the "Admin Login" or "User Login" request to authenticate
2. Replace the example email and password with valid credentials
3. After a successful login, copy the token from the response and set it as the `authToken` variable

### Testing File Operations

1. Set the `fileId` or `folderId` variable to the ID of the file or folder you want to operate on
2. Use the appropriate request from the collection to test the operation
3. Modify the request body as needed (e.g., specify the target folder ID, new name, etc.)

## Request Details

### Move Operations

#### Move File
- Endpoint: POST `/api/v2/files/move/file/{fileId}`
- Request Body:
  ```json
  {
    "newFolderId": "folder-id-to-move-to"
  }
  ```

#### Move Folder
- Endpoint: POST `/api/v2/files/move/folder/{folderId}`
- Request Body:
  ```json
  {
    "newParentId": "parent-folder-id-to-move-to"
  }
  ```

### Copy Operations

#### Copy File
- Endpoint: POST `/api/v2/files/copy/file/{fileId}`
- Request Body:
  ```json
  {
    "targetFolderId": "folder-id-to-copy-to"
  }
  ```

#### Copy Folder
- Endpoint: POST `/api/v2/files/copy/folder/{folderId}`
- Request Body:
  ```json
  {
    "targetParentId": "parent-folder-id-to-copy-to",
    "newName": "new-folder-name"
  }
  ```

### Rename Operations

#### Rename File
- Endpoint: POST `/api/v2/files/rename/file/{fileId}`
- Request Body:
  ```json
  {
    "newFileName": "new-file-name.ext"
  }
  ```

#### Rename Folder
- Endpoint: POST `/api/v2/files/rename/folder/{folderId}`
- Request Body:
  ```json
  {
    "newFolderName": "new-folder-name"
  }
  ```

## Troubleshooting

- If you receive a 401 Unauthorized error, make sure your authentication token is valid and properly set in the `authToken` variable
- If you receive a 404 Not Found error, check that the file or folder ID exists and is accessible to your user
- If you receive a 400 Bad Request error, check that your request body contains all the required fields