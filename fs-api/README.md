This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

[nvm](https://github.com/nvm-sh/nvm) is recommended to work with this app. after navigating to the project root folder, run `nvm use` and make sure node.js is the correct version defined in `.nvmrc`

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000/api/objects](http://localhost:3000/api/objects) with your browser to see the result.

## API Endpoints Documentation

### List Objects

- **Description**: Retrieve a list of objects in the filesystem.
- **Method**: GET
- **Endpoint**: `/api/objects`
- **Response**: Returns a JSON array containing the list of objects.

#### Example

```http
GET /api/objects
```

### Create Object

- **Description**: Create a new object in the filesystem.
- **Method**: POST
- **Endpoint**: `/api/objects`
- **Request Body**: The object data to be created.
- **Response**: Returns a JSON object representing the created object.

#### Example

```http
POST /api/objects

Request Body:
{
  "id": "unique_id",
  "type": "folder",
  "name": "New Folder",
  "children": []
}
```

### Get Object by ID

- **Description**: Retrieve details of a specific object by its ID.
- **Method**: GET
- **Endpoint**: `/api/object/[id]`
- **Response**: Returns a JSON object representing the object with the provided ID.

#### Example

```http
GET /api/object/unique_id
```

### Update Object by ID

- **Description**: Update details of a specific object by its ID.
- **Method**: PUT
- **Endpoint**: `/api/object/[id]`
- **Request Body**: The updated object data.
- **Response**: Returns a JSON object representing the updated object.

#### Example

```http
PUT /api/object/unique_id

Request Body:
{
  "id": "unique_id",
  "type": "folder",
  "name": "Updated Folder",
  "children": []
}
```

### Delete Object by ID

- **Description**: Delete a specific object by its ID.
- **Method**: DELETE
- **Endpoint**: `/api/object/[id]`
- **Response**: Returns a JSON object representing the deleted object.

#### Example

```http
DELETE /api/object/unique_id
```
