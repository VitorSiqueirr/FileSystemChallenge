import { byId, remove, update } from '../store'

export default function userHandler(req, res) {
  const { query, method, body } = req
  const { id } = query

  console.log(`${method} /objects/${id}`)

  switch (method) {
    case 'GET':
      const result = byId()[id]
      res.status(result ? 200 : 404).json(result ?? {})
      break
    case 'PUT':
      res.status(byId()[id] ? 200 : 404).json(update(body))
      break
    case 'DELETE':
      res.status(byId()[id] ? 200 : 404).json(remove(id))
      break
    case 'OPTIONS':
      res.status(200).end()
      break
    default:
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
