import initialObjects from './objects.json'
import { v4 as id } from 'uuid'

const objects = [...initialObjects]

export const byId = () =>
  objects.reduce((acc, o) => ({ ...acc, [o.id]: o }), {})

export const create = (props) => {
  const obj = {
    ...props,
    id: props.id || id(),
  }

  objects.push(obj)

  return obj
}

export const update = (props) => {
  const targetIndex = objects.findIndex((o) => o.id === props.id)

  if (targetIndex === -1) return {}

  objects[targetIndex] = props

  return props
}

export const remove = (id) => {
  const targetIndex = objects.findIndex((o) => o.id === id)

  if (targetIndex === -1) return {}

  const [result] = objects.splice(targetIndex, 1)

  return result
}
