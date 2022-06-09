export const objectUtil = {
  sortByKey<O extends Record<string, any>>(obj: O) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(obj).sort()) {
      result[key] = obj[key]
    }
    return result as O
  }
}
