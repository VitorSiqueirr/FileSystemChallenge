import { FilesystemObject } from '../FilesystemObject'

export function Folder({ object: folder, getObject, selectedFolderId }) {
  const isSelected = folder.id === selectedFolderId

  return (
    <li>
      📁 {isSelected ? <b>{folder.name}</b> : folder.name}
      {folder.children.length > 0 && (
        <ul>
          {folder.children.map((id) => (
            <FilesystemObject
              key={id}
              id={id}
              getObject={getObject}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
