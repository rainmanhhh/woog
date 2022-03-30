import maven from 'maven'

async function run(pomDir: string, cmd: string[], defines: Record<string, string> = {}) {
  return await maven.create({cwd: pomDir}).execute(cmd, Object.assign({'maven.test.skip': 'true'}, defines))
}

function getClassifier(jarFileName: string) {
  if (!jarFileName.endsWith('.jar')) return ''
  const fileNameWithoutSuffix = jarFileName.substr(0, jarFileName.length - 4)
  const parts = fileNameWithoutSuffix.split('-')
  const classifier = parts[parts.length - 1]
  switch (classifier) {
    case 'javadoc':
    case 'sources':
      return classifier
    default:
      return ''
  }
}

export default {run, getClassifier}
