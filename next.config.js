/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  env: {
    NOTION_PENDINGS_DATABASE_ID: process.env.NOTION_PENDINGS_DATABASE_ID,
    NOTION_CALENDAR_DATABASE_ID: process.env.NOTION_CALENDAR_DATABASE_ID,
  },
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}
