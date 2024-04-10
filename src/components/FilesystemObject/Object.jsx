import { File } from '../File'
import { Folder } from '../Folder'

export function FilesystemObject({ id, getObject, selectedFolderId }) {
  const object = getObject(id)

  if (!object) return null

  if (object.type === 'folder') {
    return (
      <Folder
        object={object}
        selectedFolderId={selectedFolderId}
        getObject={getObject}
      />
    )
  }

  if (object.type === 'file') {
    return <File object={object} />
  }
}
