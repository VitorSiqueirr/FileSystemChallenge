import { beforeEach, describe, expect, it, vi } from 'vitest'
// eslint-disable-next-line no-unused-vars
import { fetchObject, createObject, updateObject, deleteObj } from './api'
import {
  concatObjects,
  createFile,
  createFolder,
  deleteObject,
  findContent,
  moveObject,
  moveTo,
} from './filesystem'

let objects = undefined

describe('filesystem', () => {
  beforeEach(() => {
    vi.mock('./api', () => ({
      fetchObject: vi
        .fn()
        .mockImplementation((id) => Promise.resolve(objects[id])),
      createObject: vi
        .fn()
        .mockImplementation((object) => Promise.resolve(object)),
      updateObject: vi
        .fn()
        .mockImplementation((object) => Promise.resolve(object)),
      deleteObj: vi.fn().mockImplementation((url) => {
        const id = url.split('/').pop()
        const deletedObject = objects[id]
        delete objects[id]
        return Promise.resolve({ ok: true, ...deletedObject })
      }),
    }))
  })

  describe('moveTo', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['Folder2'],
        },
        Folder2: {
          id: 'Folder2',
          type: 'folder',
          name: 'Folder2',
          children: [],
        },
      }
    })
    it('moves to the required file and return a chain with the object', async () => {
      const result = await moveTo({ rootId: 'Folder', path: ['Folder2'] })
      expect(result).toEqual({
        children: [],
        id: 'Folder2',
        name: 'Folder2',
        type: 'folder',
      })
    })
  })

  describe('createFolder', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['Folder2'],
        },
        Folder2: {
          id: 'Folder2',
          type: 'folder',
          name: 'Folder2',
          children: [],
        },
      }
    })

    it('creates a new folder and adds it to the parent folder', async () => {
      const folderName = 'newFolder'
      const parentId = 'Folder'

      const { folder, parent } = await createFolder(folderName, parentId)

      expect(folder).toEqual({
        id: folderName,
        type: 'folder',
        name: folderName,
        children: [],
      })
      expect(parent.children).toContain(folderName)
    })

    describe('rejects with NAME_NOT_UNIQUE when', () => {
      it('parent folder has a child with the same name', async () => {
        const folderName = 'Folder2'
        const parentId = 'Folder'

        await expect(createFolder(folderName, parentId)).rejects.toEqual(
          'NAME_NOT_UNIQUE',
        )
      })
    })
  })

  describe('createFile', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['File'],
        },
        File: {
          id: 'File',
          type: 'folder',
          name: 'File',
          contents: '',
        },
      }
    })

    it('creates a new file and adds it to the parent folder', async () => {
      const fileName = 'newFile'
      const fileContent = 'this is a new file'
      const parentId = 'Folder'

      const { folder, parent } = await createFile(
        fileName,
        fileContent,
        parentId,
      )

      expect(folder).toEqual({
        id: fileName,
        type: 'file',
        name: fileName,
        content: fileContent,
      })
      expect(parent.children).toContain(fileName)
    })

    describe('rejects with NAME_NOT_UNIQUE when', () => {
      it('a file with the same name exists in the parent folder', async () => {
        const fileName = 'File'
        const fileContent = 'this is a new file'
        const parentId = 'Folder'

        await expect(
          createFile(fileName, fileContent, parentId),
        ).rejects.toEqual('NAME_NOT_UNIQUE')
      })
    })
  })

  describe('deleteObject', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['File', 'Folder2'],
        },
        File: {
          id: 'File',
          type: 'file',
          name: 'File',
          contents: '',
        },
        Folder2: {
          id: 'Folder2',
          type: 'folder',
          name: 'Folder2',
          children: ['File2'],
        },
        File2: {
          id: 'File2',
          type: 'file',
          name: 'File2',
          contents: '',
        },
      }
    })

    it('deletes an object and removes it from the parent folder', async () => {
      const targetName = 'File'
      const parentId = 'Folder'

      const { deletedObject, parent } = await deleteObject(targetName, parentId)

      expect(deletedObject.name).toEqual(targetName)
      expect(parent.children).not.toContain(targetName)
    })

    describe('rejects with INVALID_PARENT when', () => {
      it('the parent folder does not exist', async () => {
        const targetName = 'File'
        const parentId = 'nonexistentFolder'

        await expect(deleteObject(targetName, parentId)).rejects.toEqual(
          'INVALID_PARENT',
        )
      })

      it('the parent folder is not a folder', async () => {
        const targetName = 'File'
        const parentId = 'File'

        await expect(deleteObject(targetName, parentId)).rejects.toEqual(
          'INVALID_PARENT',
        )
      })
    })

    describe('rejects with TARGET_NOT_FOUND when', () => {
      it('the target object does not exist in the parent folder', async () => {
        const targetName = 'nonexistentFile'
        const parentId = 'Folder'

        await expect(deleteObject(targetName, parentId)).rejects.toEqual(
          'TARGET_NOT_FOUND',
        )
      })
    })

    describe('rejects with FOLDER_NOT_EMPTY when', () => {
      it('the target object is a non-empty folder', async () => {
        const targetName = 'Folder2'
        const parentId = 'Folder'

        await expect(deleteObject(targetName, parentId)).rejects.toEqual(
          'FOLDER_NOT_EMPTY',
        )
      })
    })
  })

  describe('moveObject', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['File', 'Folder2', 'File2'],
        },
        File: {
          id: 'File',
          type: 'file',
          name: 'File',
          contents: '',
        },
        Folder2: {
          id: 'Folder2',
          type: 'folder',
          name: 'Folder2',
          children: ['File2'],
        },
        File2: {
          id: 'File2',
          type: 'file',
          name: 'File2',
          contents: '',
        },
      }
    })

    it('moves an object to a new parent folder', async () => {
      const targetName = 'File'
      const rootId = 'Folder'
      const currentParentId = 'Folder'
      const path = 'Folder2'

      const { object, oldParent, newParent } = await moveObject(
        targetName,
        rootId,
        currentParentId,
        [path],
      )

      expect(object).toEqual(targetName)
      expect(oldParent.children).not.toContain(targetName)
      expect(newParent.children).toContain(targetName)
    })

    describe('rejects with NAME_NOT_UNIQUE when', () => {
      it('a file with the same name exists in the target folder', async () => {
        const targetName = 'File2'
        const rootId = 'Folder'
        const currentParentId = 'Folder'
        const path = 'Folder2'

        await expect(
          moveObject(targetName, rootId, currentParentId, [path]),
        ).rejects.toEqual('NAME_NOT_UNIQUE')
      })
    })

    describe('rejects with INVALID_OPERATION when', () => {
      it('the target folder is not a folder', async () => {
        const targetName = 'Folder2'
        const rootId = 'Folder'
        const currentParentId = 'Folder'
        const path = 'File'

        await expect(
          moveObject(targetName, rootId, currentParentId, [path]),
        ).rejects.toEqual('INVALID_OPERATION')
      })

      it('the target folder does not exist', async () => {
        const targetName = 'File'
        const rootId = 'Folder'
        const currentParentId = 'Folder'
        const path = ['NonExistentFolder']

        await expect(
          moveObject(targetName, rootId, currentParentId, [path]),
        ).rejects.toEqual('INVALID_OPERATION')
      })
    })

    describe('rejects with TARGET_NOT_FOUND when', () => {
      it('the target object does not exist', async () => {
        const targetName = 'NonExistentFile'
        const rootId = 'Folder'
        const currentParentId = 'Folder'
        const path = 'Folder2'

        await expect(
          moveObject(targetName, rootId, currentParentId, [path]),
        ).rejects.toEqual('TARGET_NOT_FOUND')
      })
    })
  })

  describe('concatObjects', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['Folder2'],
        },
        Folder2: {
          id: 'Folder2',
          type: 'folder',
          name: 'Folder2',
          children: ['File2', 'File3'],
        },
        Folder3: {
          id: 'Folder3',
          type: 'folder',
          name: 'Folder3',
          children: [],
        },
        File2: {
          id: 'File2',
          type: 'file',
          name: 'File2',
          contents: 'this is file2',
        },
        File3: {
          id: 'File3',
          type: 'file',
          name: 'File3',
          contents: 'this is file3',
        },
      }
    })

    it('concatenates the content of all files in the folder', async () => {
      const folderId = 'Folder2'
      const { contents } = await concatObjects(folderId)

      expect(contents).toEqual('this is file2\nthis is file3\n')
    })

    describe('rejects with INVALID_OPERATION when', () => {
      it('the object is not a folder', async () => {
        const folderId = 'File2'

        await expect(concatObjects(folderId)).rejects.toEqual(
          'INVALID_OPERATION',
        )
      })

      it('the folder has no children', async () => {
        const folderId = 'Folder3'

        await expect(concatObjects(folderId)).rejects.toEqual(
          'INVALID_OPERATION',
        )
      })

      it('the folder contains no files', async () => {
        const folderId = 'Folder'

        await expect(concatObjects(folderId)).rejects.toEqual(
          'INVALID_OPERATION',
        )
      })
    })
  })

  describe('findContent', () => {
    beforeEach(() => {
      objects = {
        Folder: {
          id: 'Folder',
          type: 'folder',
          name: 'Folder',
          children: ['Folder2'],
        },
        Folder2: {
          id: 'Folder2',
          type: 'folder',
          name: 'Folder2',
          children: ['File2', 'File3'],
        },
        Folder3: {
          id: 'Folder3',
          type: 'folder',
          name: 'Folder3',
          children: [],
        },
        File2: {
          id: 'File2',
          type: 'file',
          name: 'File2',
          contents: 'this is file2',
        },
        File3: {
          id: 'File3',
          type: 'file',
          name: 'File3',
          contents: 'this is file3',
        },
      }
    })

    it('returns the names of all files containing the search string', async () => {
      const searchString = 'this is'
      const folderId = 'Folder2'

      const matchingFiles = await findContent(searchString, folderId)

      expect(matchingFiles).toEqual(['File2', 'File3'])
    })

    it('returns an empty array if no files contain the search string', async () => {
      const searchString = 'nonexistentString'
      const folderId = 'Folder2'

      const matchingFiles = await findContent(searchString, folderId)

      expect(matchingFiles).toEqual([])
    })

    describe('rejects with INVALID_OPERATION when', () => {
      it('the object is not a folder', async () => {
        const searchString = 'this is'
        const folderId = 'File2'

        await expect(findContent(searchString, folderId)).rejects.toEqual(
          'INVALID_OPERATION',
        )
      })

      it('the folder contains no files', async () => {
        const searchString = 'this is'
        const folderId = 'Folder'

        await expect(findContent(searchString, folderId)).rejects.toEqual(
          'INVALID_OPERATION',
        )
      })
    })
  })
})
