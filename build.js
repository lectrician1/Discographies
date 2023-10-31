require('esbuild').build({
    entryPoints: ['Discographies.ts'],
    bundle: true,
    outfile: 'script.js',
    minify: true,
    banner: {
      js: `/**
      * THIS IS A COMPILED TYPESCRIPT FILE
      * SEE THE ACTUAL SOURCE CODE AT User:Lectrician1/discographies.js/ts.js
      * 
      * Name: discographies.js
      * Description: Shows useful discography data and functions on 
      *  discography items
      * Note: Only meant to work on page refresh. This is because the 
      *  lag time between creating a statement like "publication date"
      *  and it showing up in BlazeGraph and then by this script is high.
      * Author: Lectrician1
      * License: CC0
      * Functions taken from: 
      *  https://www.wikidata.org/wiki/User:Nikki/ExMusica.js
      *  https://www.wikidata.org/wiki/User:Magnus_Manske/duplicate_item.js
      */`
    }
  }).catch(() => process.exit(1))