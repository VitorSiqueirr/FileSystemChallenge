# HTTP Filesystem by Vitor Siqueira
# Filesystem

The behavior of the app is described in the gist https://gist.github.com/jprask/9f6870db5f851d08bcbff42f1e9a1f03.

[nvm](https://github.com/nvm-sh/nvm) is recommended to work with this app. after navigating to the project root folder, run `nvm use` and make sure node.js is the correct version defined in `.nvmrc`

There's a few useful commands to run when developing.

`npm run dev` - start the dev server

`npm run test` - run unit tests

# API

To run this app, you must also run the API on port 3000 in your local machine. To do this, you can run the following command

```bash
cd ../fs-api
npm run dev
```

further documentation for the API in found on [fs-api/README.md](../fs-api/README.md)

# Project tasks

The filesystem app allows us to manage files and folders, similar to your favorite operating system. The best part is that it saves our objects on the server! So even if our computer gets bricked, the files and folders are still available! The app allows the user to navigate and create new objects using familiar commands such as `cd` and `mkdir`.

The current functionality of this app is basic; it only renders the filesystem and allows the user to navigate folders. However, we will be adding a lot more functionality!

Below is the data structure it uses:

```js
{
  id: 'string',
  type: 'folder',
  name: 'string',
  children: ['string']
}
```

```js
{
  id: 'string',
  type: 'file',
  name: 'string',
  contents: 'string'
}
```

> [!WARNING]  
> Do not use async/await to solve these tasks. The purpose of this challenge is to cover javascript promises specifically.

## Task 1 - Basic API interaction

Let's start by focusing on the API calls to manipulate objects. Since our API is only a store, we will need to handle all the application logic on the client side. The entry point for this task will be the `src/services/filesystem.js` file, but feel free to create additional constructs as needed to organize the code.

1 - Define a `createFolder` function. This function will receive a folder `name` and optionally a `parentId` representing the ID of the containing folder. It should return a promise of a folder object compliant with the folder data structure and optionally (when given a `parentId`), a `parent` object representing the updated parent.

  * If the `parentId` is not passed, simply save the new folder.
  * If the `parentId` is passed, validate that the `name` is unique among all children of the parent folder. If this validation fails, the folder promise should be rejected with the following error massage: `'NAME_NOT_UNIQUE'`.
  * If the `parentId` is passed, after saving the new folder, update the parent's `children` array to include the new folder's ID as the last element in the array.

2 - Define a `createFile` function. This function will receive a `folderId` as well as the `name` and `content` of the new file. It should return a promise of a file object compliant with the data structure, as well as the updated parent.

  * Similar to the `createFolder` function, if the name is not unique within the parent folder, the file promise should fail with the following error message: `'NAME_NOT_UNIQUE'`.
  * After saving the new file, you must update the parent's `children` array to include the new file ID as the last element in the array.

Now we'll focus on moving and removing files.

3 - Define a `remove` function that takes a `parentId` as well as a `targetName`, and then finds an object which has the same `name` as the given `targetName` and deletes that object. This function must return a promise of an object (either folder or file).

Step by step:

- fetch the parent folder using `parentId`
- fetch all child objects
- search the child objects for an object with `name` equal to `targetName`
- delete and return the target

Validations:

- if the object fetched with `parentId` does not exist or is not a folder, the promise must reject with the error message `'INVALID_PARENT'`.
- if the server request is successful, it should return the deleted object. If the target is not found, the promise must reject with the error message `'TARGET_NOT_FOUND'`.
- if the deleted object is a folder with one or more children, the promise must reject with the error message `'FOLDER_NOT_EMPTY'`.

4 - Define a `move` function. This function receives four params: `targetName`, `rootId` (represents the root folder id), `currentParentId`, and `path` (represents the path to the target folder, for example: `/some/folder`). It should remove the child with `targetName` from the current parent's `children` array and add it to the new folder's `children` array. It must return the promise of three objects: The object itself, the old folder, and the new folder.

Step by step:

- use the given `path` and `rootId` to find the target folder using the existing `moveTo` function
- fetch the current parent using `currentParentId`
- remove the object with `targetName` from the current parent's children
- add the object to the target parent's children

Validations: 

- current parent and target parent are of type `folder`, if the validation fails it should reject with the message `'INVALID_OPERATION'`.
- the `object` is currently a child of the current parent. If this validation fails the promise should reject with the error message `'INVALID_OPERATION'`.
- the object's name is unique in the target parent. If the name is not unique within the new parent, the promise should reject with the error message `'NAME_NOT_UNIQUE'`.

> [!IMPORTANT]  
> You don't need to interact with the react app to implement these functions. You can use the browser console as well as unit tests to test the implementation.

> [!IMPORTANT]  
> The source of truth for all the validations described in this task should be the server and not the objects stored on the client.

## Task 2 Additional commands

1 - Implement a `concat` function. This command will concatenate the contents of all files in the current folder. Given the `folderID`, read each of the files listed in this folder concurrently, and then return an array with the `contents`, in the order specified by the `children` array. If the folder contains no files, the function should reject with the error message `'INVALID_OPERATION'`.

2 - Implement a `find` function. This command takes a string and performs a search on all files under the current folder. It should display the names of any file containing an exact match of the given text in its contents. If the folder contains no files, the function should reject with the message `'INVALID_OPERATION'`. If there are no matches, it should resolve to an empty array.

> [!IMPORTANT]  
> Just like task #1, you don't need to interact with the react app to implement these functions. You can use the browser console as well as unit tests to test the implementation.

## Task 3 - Adding the UI

This task is about hooking our newly defined operations into the UI. You should add four new commands: `mkdir`, `touch`, `mv`, and `rm`, `concat`, and `find`

`mkdir <dir_name>`

When the user types the `mkdir` command, parse and validate the `dir_name` param and then call the `createFolder` function from task #1. If the command is successful, a new folder should be displayed as the last element under the current directory. If it fails with the `NAME_NOT_UNIQUE` error, a message should be displayed.

--- 

`touch <file_name> ...<file_contents>`

When the user types the `touch` command, parse and validate the `file_name` and `file_contents` param and then call the `createFile` function from task #1. If the command is successful, a new file should be displayed as the last element under the current directory. If it fails with the `NAME_NOT_UNIQUE` error, a message should be displayed.

--- 

`rm <object_name>`

When the user types the `rm` command, parse and validate the `object_name` and then call the `delete` function from task #1. If the command is successful, the file should be removed from the current directory. If a validation error occurs, it should be displayed to the user.

--- 

`mv <object_name> <new_folder_path>`

When the user types the `mv` command, parse and validate the `object_name` and `new_folder_path` param and then call the `move` function from task #1. If the command is successful, the file should be removed from the current directory, and it should appear as the last file in its new directory. If a validation error occurs, it should be displayed to the user.

---

`concat`

When the user types the `concat` command, call the `concat` function from task #2 with the context of the current folder and display the results to the user.

For example given the following objects:

```js
{
  id: 'folder_1',
  type: 'folder',
  name: '/',
  children: ['file_1', 'file_2']
}
```

```js
{
  id: 'file_1',
  type: 'file',
  name: 'first line!',
  contents: 'this is the first line'
}
```

```js
{
  id: 'file_2',
  type: 'file',
  name: 'second line!',
  contents: 'this is the second line'
}
```

When the user types `concat` in the context of `folder_1`, the UI should show the following:

```
this is the first line
this is the second line
```

If the `contents` were empty, it should display

```
Error: No files in the current folder
```

---

`find <target>`

When the user invokes the find command, parse and validate the target string and then call the `find` function from task #2 within the context of the current folder. Finally, display the results to the user.

Example:

```js
{
  id: 'folder_1',
  type: 'folder',
  name: '/',
  children: ['file_1', 'file_2', 'file_3']
}
```

```js
{
  id: 'file_1',
  type: 'file',
  name: 'first file',
  contents: 'what\'s the deal with airline food?'
}
```

```js
{
  id: 'file_2',
  type: 'file',
  name: 'second file',
  contents: 'this is the second file'
}
```

```js
{
  id: 'file_3',
  type: 'file',
  name: 'third file',
  contents: 'what\'s the deal with airplane peanuts'
}
```

When the user types `find what's the deal` in the context of `folder_1`, the UI should show the following:

```
first file
third file
```

When the user types `find lake city quiet pills` in the context of `folder_1`, the UI should show the following:

```
No matches found
```

If the `contents` were empty, it should display

```
Error: No files in the current folder
```

---

Note: For all the commands above, if an unexpected networking error occurs, it should be displayed to the user.

## Extra task - `chroot`

Implement a new command, `chroot`, which takes the same inputs as the `cd` command. The `chroot` command will find the target folder, always starting from the root (just like `cd`), and then it will set the resulting folder, if any, as the new root folder. If no folder is found, display an error in the UI.

Example, given the following objects:

```json
  {
    "id": "root_id",
    "type": "folder",
    "name": "/",
    "children": ["notes_id", "music_id"]
  },
  {
    "id": "notes_id",
    "type": "folder",
    "name": "notes",
    "children": []
  },
  {
    "id": "music_id",
    "type": "folder",
    "name": "music",
    "children": []
  },
```

The app renders

```html
<ul>
  <li>📁 <b>/</b>
    <ul>
      <li>📁 notes</li>
      <li>📁 music</li>
    </ul>
  </li>
</ul>
```

After the user invokes the following command: `chroot /notes`, it should instead render the following

```html
<ul>
  <li>📁 <b>notes</b></li>
</ul>
```

All commands should still work like before, except that now the root folder should be `notes_id`.

Note: This implementation should only affect the frontend, that is, all the objects should remain saved on the backend. Further, if the user reloads the page, the root folder should revert to the original one that is currently hardcoded in the application.