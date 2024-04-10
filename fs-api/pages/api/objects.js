import { byId, create } from './store'

export default function handler(req, res) {
  const { method, body } = req

  console.log(`${method} /objects`, { body })

  switch (method) {
    case 'GET':
      res.status(200).json(byId())
      break
    case 'POST':
      res.status(200).json(create(body))
      break
    case 'OPTIONS':
      res.status(200).end()
      break
    default:
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
