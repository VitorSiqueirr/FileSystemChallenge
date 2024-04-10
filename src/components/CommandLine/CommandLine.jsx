import { useState } from 'react'
import { moveTo } from '../../services/filesystem'
import './CommandLine.css'

export function CommandLine({ rootId, setSelectedFolderId }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (event) => {
    const [command, ...args] = input.split(' ')

    const commands = {
      cd() {
        const [rawNamePath] = args
        const path = rawNamePath.split('/').filter(Boolean)

        setIsLoading(true)

        moveTo({ rootId, path })
          .then((newSelectedFolder) =>
            setSelectedFolderId(newSelectedFolder.id),
          )
          .catch(() => setError('invalid folder'))
          .finally(() => setIsLoading(false))
      },
    }

    const operation = commands[command]

    event.preventDefault()
    setError(null)
    setInput('')

    if (!operation) return setError(`invalid input: ${input}`)

    operation()
  }

  return (
    <div className="command-line-container">
      {error && <p className="command-line-error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="title"
          name="title"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          disabled={isLoading}
        />
      </form>
    </div>
  )
}
