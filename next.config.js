/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NOTION_PENDINGS_DATABASE_ID: process.env.NOTION_PENDINGS_DATABASE_ID,
    NOTION_CALENDAR_DATABASE_ID: process.env.NOTION_CALENDAR_DATABASE_ID,
  }
}
