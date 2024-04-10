import { useEffect, useState } from 'react'
import { FilesystemObject } from './components/FilesystemObject'
import { CommandLine } from './components/CommandLine'
import { fetchAll } from './services/api'

const LOAD_STATES = {
  PENDING: 'PENDING',
  LOADING: 'LOADING',
  DONE: 'DONE',
  FAILED: 'FAILED',
}

function App() {
  const [objects, setObjects] = useState({})
  const [loadState, setLoadState] = useState(LOAD_STATES.PENDING)
  const [selectedFolderId, setSelectedFolderId] = useState('root')

  useEffect(() => {
    if (loadState === LOAD_STATES.PENDING) {
      setLoadState(LOAD_STATES.LOADING)

      fetchAll()
        .then((result) => {
          setObjects(result)
          setLoadState(LOAD_STATES.DONE)
        })
        .catch(() => setLoadState(LOAD_STATES.FAILED))
    }
  }, [loadState])

  if (loadState === LOAD_STATES.PENDING) return null
  if (loadState === LOAD_STATES.LOADING) return 'loading...'
  if (loadState === LOAD_STATES.FAILED) return 'failed to fetch objects'

  const getObject = (id) => objects[id] ?? null

  return (
    <main>
      <header>
        <h1>fs/</h1>
      </header>

      <ul>
        <FilesystemObject
          id="root"
          getObject={getObject}
          selectedFolderId={selectedFolderId}
        />
      </ul>

      <CommandLine rootId="root" setSelectedFolderId={setSelectedFolderId} />
    </main>
  )
}

export default App
