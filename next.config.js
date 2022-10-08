/** @type {import('next').NextConfig} */
const path = require('path')

module.exports = {
  env: { },
  reactStrictMode: true,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
}
