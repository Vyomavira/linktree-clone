require('dotenv').config()

const cors = require('cors')
const express = require('express')
const mongoose = require('mongoose')

const app = express()
const port = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const linkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    order: { type: Number, default: 0 },
  },
  { timestamps: false },
)

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9_-]+$/,
      maxlength: 30,
    },
    bio: { type: String, trim: true, maxlength: 300, default: '' },
    photo: { type: String, trim: true, maxlength: 2048, default: '' },
    socials: { type: [String], default: [] },
    links: { type: [linkSchema], default: [] },
  },
  { timestamps: true },
)

const Profile = mongoose.model('Profile', profileSchema)

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function normalizeProfileInput(body) {
  const profile = {
    name: body.name,
    username: typeof body.username === 'string' ? body.username.trim().replace(/^@/, '').toLowerCase() : body.username,
    bio: body.bio,
    photo: body.photo,
    socials: body.socials,
  }
  if (typeof profile.photo === 'string' && profile.photo.trim()) {
    profile.photo = validateExternalUrl(profile.photo, 'Photo URL')
  }
  if (Array.isArray(profile.socials)) {
    profile.socials = profile.socials.map((social) => validateExternalUrl(social, 'Social URL'))
  }
  return profile
}

function validateExternalUrl(value, fieldName) {
  if (typeof value !== 'string' || value.length > 2048) {
    const error = new Error(`${fieldName} must be a valid http or https URL.`)
    error.status = 400
    throw error
  }
  let url
  try {
    url = new URL(value)
  } catch {
    const error = new Error(`${fieldName} must be a valid http or https URL.`)
    error.status = 400
    throw error
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    const error = new Error(`${fieldName} must be a valid http or https URL.`)
    error.status = 400
    throw error
  }
  return url.toString()
}

app.post('/api/profiles', asyncRoute(async (req, res) => {
  const profile = new Profile(normalizeProfileInput(req.body))
  await profile.save()
  res.status(201).json(profile)
}))

app.get('/api/profiles/:username', asyncRoute(async (req, res) => {
  const profile = await Profile.findOne({ username: req.params.username.toLowerCase() })
  if (!profile) return res.status(404).json({ message: 'Profile not found.' })
  res.json(profile)
}))

app.put('/api/profiles/:username', asyncRoute(async (req, res) => {
  const updates = normalizeProfileInput(req.body)
  if (typeof updates.username !== 'string' || !updates.username) delete updates.username
  const profile = await Profile.findOneAndUpdate(
    { username: req.params.username.toLowerCase() },
    { $set: updates },
    { new: true, runValidators: true },
  )
  if (!profile) return res.status(404).json({ message: 'Profile not found.' })
  res.json(profile)
}))

app.post('/api/profiles/:username/links', asyncRoute(async (req, res) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
  if (!title || title.length > 120) {
    return res.status(400).json({ message: 'Link title is required and must be 120 characters or fewer.' })
  }
  const url = validateExternalUrl(req.body.url, 'Link URL')
  const profile = await Profile.findOne({ username: req.params.username.toLowerCase() })
  if (!profile) return res.status(404).json({ message: 'Profile not found.' })

  profile.links.push({ title, url, order: profile.links.length })
  await profile.save()
  res.status(201).json(profile)
}))

app.delete('/api/profiles/:username/links/:id', asyncRoute(async (req, res) => {
  const profile = await Profile.findOne({ username: req.params.username.toLowerCase() })
  if (!profile) return res.status(404).json({ message: 'Profile not found.' })
  const link = profile.links.id(req.params.id)
  if (!link) return res.status(404).json({ message: 'Link not found.' })
  link.deleteOne()
  profile.links.forEach((item, index) => { item.order = index })
  await profile.save()
  res.json(profile)
}))

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)
  if (error.code === 11000) {
    return res.status(409).json({ message: 'That username is already taken.' })
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message })
  }
  console.error(error)
  res.status(error.status || 500).json({
    message: error.status ? error.message : 'An unexpected server error occurred.',
  })
})

async function start() {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<')) {
    throw new Error('Set a valid MongoDB Atlas connection string in server/.env as MONGO_URI.')
  }
  await mongoose.connect(process.env.MONGO_URI)
  app.listen(port, () => {
    console.log(`Linktree API listening on http://localhost:${port}`)
  })
}

start().catch((error) => {
  console.error(`Unable to start server: ${error.message}`)
  process.exitCode = 1
})
