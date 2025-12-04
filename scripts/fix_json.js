#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const p = process.argv[2]
const out = process.argv[3] || p
if (!p) {
  console.error('Usage: node scripts/fix_json.js <input.json> [output.json]')
  process.exit(2)
}
let s = fs.readFileSync(p, 'utf8')
function tryParse(str){
  try { JSON.parse(str); return true }
  catch(e){ return e.message }
}
const ok = tryParse(s)
if (ok === true) {
  console.log('File is valid JSON — no change needed')
  process.exit(0)
}
console.error('Initial parse error:', ok)

// Try trimming trailing whitespace and non-json after the last closing brace/bracket
const lastClose = Math.max(s.lastIndexOf('}'), s.lastIndexOf(']'))
if (lastClose === -1) {
  console.error('No closing JSON bracket found in file')
  process.exit(1)
}
const trimmed = s.slice(0, lastClose + 1)
const ok2 = tryParse(trimmed)
if (ok2 === true) {
  fs.writeFileSync(out, trimmed)
  console.log('Trimmed file written to', out)
  process.exit(0)
}

console.error('Trim attempt failed:', ok2)
// As a last resort, try to find a JSON object by searching for first '{' and last '}'
const firstOpen = s.indexOf('{')
if (firstOpen !== -1 && lastClose > firstOpen) {
  const sub = s.slice(firstOpen, lastClose+1)
  const ok3 = tryParse(sub)
  if (ok3 === true) {
    fs.writeFileSync(out, sub)
    console.log('Extracted JSON object and wrote to', out)
    process.exit(0)
  }
}

console.error('Unable to auto-fix JSON. Please open the file and remove trailing garbage.')
process.exit(1)
