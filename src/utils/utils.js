export function chain(...tasks) {
  return tasks.reduce((p, task) => p.then(task), Promise.resolve())
}
