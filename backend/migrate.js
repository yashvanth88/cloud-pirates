#!/usr/bin/env node
require('dotenv').config()
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

async function main(){
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL not set')
    process.exit(2)
  }
  const sql = fs.readFileSync(path.join(__dirname,'db','schema.sql'),'utf8')
  const client = new Client({ connectionString: url })
  await client.connect()
  try {
    console.log('Applying schema.sql to', url)
    await client.query(sql)
    console.log('Schema applied')
  } catch(e){
    console.error('Migration error', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch(e=>{ console.error(e); process.exit(1) })
