import { chain } from '../utils'
import { fetchObject, updateObject, createObject, deleteObj } from './api'

export function moveTo({ rootId, path }) {
  const fetchRoot = () => fetchObject(rootId)

  const moves = path.map((step) => (parent) => {
    if (!parent || rootId.type === 'file') {
      throw new Error('INVALID_OPERATION')
    }
    return Promise.all(parent.children.map(fetchObject)).then((children) =>
      children.find((child) => child.name === step),
    )
  })

  return chain(fetchRoot, ...moves)
}

export function createFolder(name, parentId = 'root') {
  return new Promise((resolve, reject) => {
    let newFolder = {
      id: name,
      type: 'folder',
      name: name,
      children: [],
    }
    let parentFolder

    fetchObject(parentId)
      .then((fetchedFolder) => {
        parentFolder = fetchedFolder
        if (parentFolder.children.includes(name))
          return reject('NAME_NOT_UNIQUE')

        parentFolder.children.push(newFolder.id)
        return updateObject(parentFolder)
      })
      .then(() => createObject(newFolder))
      .then(() => resolve({ folder: newFolder, parent: parentFolder }))
      .catch(reject)
  })
}

export function createFile(name, content = '', folderId = 'root') {
  return new Promise((resolve, reject) => {
    let newFile = {
      id: name,
      type: 'file',
      name: name,
      content: content,
    }
    let fileParent

    fetchObject(folderId)
      .then((fetchedParent) => {
        fileParent = fetchedParent
        if (fileParent.children.includes(name)) {
          return reject('NAME_NOT_UNIQUE')
        }

        fileParent.children.push(newFile.id)
        return updateObject(fileParent)
      })
      .then(() => createObject(newFile))
      .then(() => resolve({ folder: newFile, parent: fileParent }))
      .catch(reject)
  })
}

export function deleteObject(targetName, parentId = 'root') {
  return new Promise((resolve, reject) => {
    let target = undefined
    let parentFolder = undefined
    fetchObject(parentId)
      .then((fetchedFolder) => {
        if (!fetchedFolder || fetchedFolder.type !== 'folder')
          return reject('INVALID_PARENT')

        parentFolder = fetchedFolder
        return Promise.all(parentFolder.children.map(fetchObject))
      })
      .then((children) => {
        target = children.find((child) => child.name === targetName)
        if (!target) return reject('TARGET_NOT_FOUND')

        if (target.type === 'folder' && target.children.length > 0)
          return reject('FOLDER_NOT_EMPTY')

        parentFolder.children = parentFolder.children.filter(
          (childId) => childId !== target.id,
        )
        return updateObject(parentFolder)
      })
      .then(() => deleteObj(target.id))
      .then((data) => {
        return resolve({ deletedObject: data, parent: parentFolder })
      })
      .catch(reject)
  })
}

export function moveObject(targetName, rootId, currentParentId, path) {
  return new Promise((resolve, reject) => {
    let targetFolder
    let currentParent
    let targetObject
    moveTo({ rootId, path })
      .then((fetchedFolder) => {
        if (!fetchedFolder || fetchedFolder.type !== 'folder') {
          return reject('INVALID_OPERATION')
        }
        targetFolder = fetchedFolder
        return fetchObject(currentParentId)
      })
      .then((fetchedParent) => {
        if (!fetchedParent || fetchedParent.type !== 'folder') {
          return reject('INVALID_OPERATION')
        }
        currentParent = fetchedParent
        const targetIndex = currentParent.children.indexOf(targetName)
        if (targetIndex === -1) {
          return reject('TARGET_NOT_FOUND')
        }
        if (targetFolder.children.includes(targetName)) {
          return reject('NAME_NOT_UNIQUE')
        }
        targetObject = currentParent.children.splice(targetIndex, 1)[0]
        targetFolder.children.push(targetObject)
        return Promise.all([
          updateObject(currentParent),
          updateObject(targetFolder),
        ])
      })
      .then(() => {
        resolve({
          object: targetObject,
          oldParent: currentParent,
          newParent: targetFolder,
        })
      })
      .catch(reject)
  })
}

export function concatObjects(folderId) {
  return new Promise((resolve, reject) => {
    let folder
    fetchObject(folderId)
      .then((fetchedFolder) => {
        if (
          fetchedFolder.type !== 'folder' ||
          fetchedFolder.children.length === 0
        ) {
          return reject('INVALID_OPERATION')
        }
        folder = fetchedFolder
        return Promise.all(folder.children.map(fetchObject))
      })
      .then((files) => {
        const contents = files.reduce((acc, file) => {
          if (file.type !== 'file') {
            return reject('INVALID_OPERATION')
          }
          return acc + file.contents + '\n'
        }, '')
        resolve({ contents })
      })
      .catch(reject)
  })
}

export function findContent(searchString, folderId) {
  return new Promise((resolve, reject) => {
    let folder
    fetchObject(folderId)
      .then((fetchedFolder) => {
        if (
          fetchedFolder.type !== 'folder' ||
          fetchedFolder.children.length === 0
        ) {
          return reject('INVALID_OPERATION')
        }
        folder = fetchedFolder
        return Promise.all(folder.children.map(fetchObject))
      })
      .then((files) => {
        const matchingFiles = files.filter((file) => {
          if (file.type !== 'file') {
            return reject('INVALID_OPERATION')
          }
          return file.contents.includes(searchString)
        })
        if (matchingFiles.length === 0) {
          resolve([])
        } else {
          resolve(matchingFiles.map((file) => file.name))
        }
      })
      .catch(reject)
  })
}

window.createFile = createFile
window.fetchObject = fetchObject
window.moveObject = moveObject
window.findContent = findContent
window.createFolder = createFolder
window.deleteObject = deleteObject
window.concatObjects = concatObjects
