import path from 'path'
import resolvePlugin from '@rollup/plugin-node-resolve'
export default {
  input: path.resolve(__dirname, 'index.js'),
  output:  {
    name: 'bundle',
    format: 'iife',
    globals: 'reactive',
    sourcemap: true,
    globals: {
      'bundle': '$$'
    },
    file: path.resolve(__dirname, 'dist/bundle-global.js')
  },
  plugins: [
    resolvePlugin()
  ]
}