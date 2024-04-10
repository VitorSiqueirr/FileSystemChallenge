export function File({ object: file }) {
  return <li title={file.contents}>{file.name}</li>
}
