require('esbuild').build({
    entryPoints: ['Discographies.ts'],
    bundle: true,
    outfile: 'script.js',
    minify: true,
  }).catch(() => process.exit(1))