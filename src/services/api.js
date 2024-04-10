const BASE_URL = 'http://localhost:3000/api'

function handleFetch(res) {
  if (res.ok) {
    return res.json()
  } else {
    throw new Error('Error: ' + res.status)
  }
}

export function fetchAll() {
  return fetch(`${BASE_URL}/objects`).then(handleFetch)
}

export function fetchObject(id) {
  return fetch(`${BASE_URL}/object/${id}`).then(handleFetch)
}

export function updateObject(object) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/object/${object.id}`

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(object),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update object')
        }
        return response.json()
      })
      .then((data) => {
        return resolve(data)
      })
      .catch((error) => reject(error))
  })
}

export function createObject(object) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/objects`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(object),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to create object')
        }
        return response.json()
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error))
  })
}

export function deleteObj(targetId) {
  return new Promise((reject, resolve) => {
    fetch(`${BASE_URL}/object/${targetId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete object')
        }
        return response.json()
      })
      .then((data) => {
        return resolve(data)
      })
      .catch((error) => reject(error))
  })
}
