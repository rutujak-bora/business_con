import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URL)
let db = null

async function getDb() {
  if (!db) {
    await client.connect()
    db = client.db(process.env.DB_NAME || 'business_consultant')
  }
  return db
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Helper function for responses
function jsonResponse(data, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders })
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET handler
export async function GET(request, { params }) {
  try {
    const path = params?.path || []
    const endpoint = path.join('/')

    // Health check
    if (endpoint === 'health' || endpoint === '') {
      return jsonResponse({ status: 'healthy', timestamp: new Date().toISOString() })
    }

    // Get all contact submissions
    if (endpoint === 'contacts') {
      const database = await getDb()
      const contacts = await database.collection('contacts').find({}).sort({ createdAt: -1 }).toArray()
      return jsonResponse({ success: true, data: contacts })
    }

    // Get all newsletter subscriptions
    if (endpoint === 'newsletter') {
      const database = await getDb()
      const subscribers = await database.collection('newsletter').find({}).sort({ createdAt: -1 }).toArray()
      return jsonResponse({ success: true, data: subscribers })
    }

    // Get all case studies
    if (endpoint === 'case-studies') {
      const database = await getDb()
      const caseStudies = await database.collection('case_studies').find({}).sort({ createdAt: -1 }).toArray()
      return jsonResponse({ success: true, data: caseStudies })
    }

    // Get all blog articles
    if (endpoint === 'articles') {
      const database = await getDb()
      const articles = await database.collection('articles').find({}).sort({ createdAt: -1 }).toArray()
      return jsonResponse({ success: true, data: articles })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('GET Error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

// POST handler
export async function POST(request, { params }) {
  try {
    const path = params?.path || []
    const endpoint = path.join('/')
    const body = await request.json()

    // Contact form submission
    if (endpoint === 'contact') {
      const { name, email, company, message } = body

      if (!name || !email || !message) {
        return jsonResponse({ error: 'Name, email, and message are required' }, 400)
      }

      const database = await getDb()
      const contact = {
        id: uuidv4(),
        name,
        email,
        company: company || '',
        message,
        status: 'new',
        createdAt: new Date().toISOString()
      }

      await database.collection('contacts').insertOne(contact)
      return jsonResponse({ success: true, message: 'Contact form submitted successfully', data: contact }, 201)
    }

    // Newsletter subscription
    if (endpoint === 'newsletter') {
      const { email } = body

      if (!email) {
        return jsonResponse({ error: 'Email is required' }, 400)
      }

      const database = await getDb()
      
      // Check if already subscribed
      const existing = await database.collection('newsletter').findOne({ email })
      if (existing) {
        return jsonResponse({ success: true, message: 'Already subscribed' })
      }

      const subscriber = {
        id: uuidv4(),
        email,
        subscribedAt: new Date().toISOString()
      }

      await database.collection('newsletter').insertOne(subscriber)
      return jsonResponse({ success: true, message: 'Subscribed successfully', data: subscriber }, 201)
    }

    // Create case study (for CMS functionality)
    if (endpoint === 'case-studies') {
      const { title, category, result, description, image, metrics } = body

      if (!title || !category || !description) {
        return jsonResponse({ error: 'Title, category, and description are required' }, 400)
      }

      const database = await getDb()
      const caseStudy = {
        id: uuidv4(),
        title,
        category,
        result: result || '',
        description,
        image: image || '',
        metrics: metrics || [],
        createdAt: new Date().toISOString()
      }

      await database.collection('case_studies').insertOne(caseStudy)
      return jsonResponse({ success: true, message: 'Case study created', data: caseStudy }, 201)
    }

    // Create article (for CMS functionality)
    if (endpoint === 'articles') {
      const { title, category, excerpt, content, author } = body

      if (!title || !content) {
        return jsonResponse({ error: 'Title and content are required' }, 400)
      }

      const database = await getDb()
      const article = {
        id: uuidv4(),
        title,
        category: category || 'General',
        excerpt: excerpt || content.substring(0, 150) + '...',
        content,
        author: author || 'Alexander Reed',
        readTime: `${Math.ceil(content.split(' ').length / 200)} min read`,
        createdAt: new Date().toISOString(),
        publishedAt: new Date().toISOString()
      }

      await database.collection('articles').insertOne(article)
      return jsonResponse({ success: true, message: 'Article created', data: article }, 201)
    }

    // Book consultation
    if (endpoint === 'consultations') {
      const { name, email, company, date, time, topic } = body

      if (!name || !email || !date || !time) {
        return jsonResponse({ error: 'Name, email, date, and time are required' }, 400)
      }

      const database = await getDb()
      const consultation = {
        id: uuidv4(),
        name,
        email,
        company: company || '',
        date,
        time,
        topic: topic || 'General Consultation',
        status: 'pending',
        createdAt: new Date().toISOString()
      }

      await database.collection('consultations').insertOne(consultation)
      return jsonResponse({ success: true, message: 'Consultation booked successfully', data: consultation }, 201)
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('POST Error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

// PUT handler
export async function PUT(request, { params }) {
  try {
    const path = params?.path || []
    const endpoint = path[0]
    const id = path[1]
    const body = await request.json()

    if (!id) {
      return jsonResponse({ error: 'ID is required' }, 400)
    }

    const database = await getDb()

    // Update contact status
    if (endpoint === 'contacts') {
      const result = await database.collection('contacts').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      
      if (result.matchedCount === 0) {
        return jsonResponse({ error: 'Contact not found' }, 404)
      }
      
      return jsonResponse({ success: true, message: 'Contact updated' })
    }

    // Update case study
    if (endpoint === 'case-studies') {
      const result = await database.collection('case_studies').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      
      if (result.matchedCount === 0) {
        return jsonResponse({ error: 'Case study not found' }, 404)
      }
      
      return jsonResponse({ success: true, message: 'Case study updated' })
    }

    // Update article
    if (endpoint === 'articles') {
      const result = await database.collection('articles').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      
      if (result.matchedCount === 0) {
        return jsonResponse({ error: 'Article not found' }, 404)
      }
      
      return jsonResponse({ success: true, message: 'Article updated' })
    }

    // Update consultation status
    if (endpoint === 'consultations') {
      const result = await database.collection('consultations').updateOne(
        { id },
        { $set: { ...body, updatedAt: new Date().toISOString() } }
      )
      
      if (result.matchedCount === 0) {
        return jsonResponse({ error: 'Consultation not found' }, 404)
      }
      
      return jsonResponse({ success: true, message: 'Consultation updated' })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('PUT Error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

// DELETE handler
export async function DELETE(request, { params }) {
  try {
    const path = params?.path || []
    const endpoint = path[0]
    const id = path[1]

    if (!id) {
      return jsonResponse({ error: 'ID is required' }, 400)
    }

    const database = await getDb()

    // Delete contact
    if (endpoint === 'contacts') {
      const result = await database.collection('contacts').deleteOne({ id })
      if (result.deletedCount === 0) {
        return jsonResponse({ error: 'Contact not found' }, 404)
      }
      return jsonResponse({ success: true, message: 'Contact deleted' })
    }

    // Delete case study
    if (endpoint === 'case-studies') {
      const result = await database.collection('case_studies').deleteOne({ id })
      if (result.deletedCount === 0) {
        return jsonResponse({ error: 'Case study not found' }, 404)
      }
      return jsonResponse({ success: true, message: 'Case study deleted' })
    }

    // Delete article
    if (endpoint === 'articles') {
      const result = await database.collection('articles').deleteOne({ id })
      if (result.deletedCount === 0) {
        return jsonResponse({ error: 'Article not found' }, 404)
      }
      return jsonResponse({ success: true, message: 'Article deleted' })
    }

    // Unsubscribe from newsletter
    if (endpoint === 'newsletter') {
      const result = await database.collection('newsletter').deleteOne({ id })
      if (result.deletedCount === 0) {
        return jsonResponse({ error: 'Subscriber not found' }, 404)
      }
      return jsonResponse({ success: true, message: 'Unsubscribed successfully' })
    }

    // Delete consultation
    if (endpoint === 'consultations') {
      const result = await database.collection('consultations').deleteOne({ id })
      if (result.deletedCount === 0) {
        return jsonResponse({ error: 'Consultation not found' }, 404)
      }
      return jsonResponse({ success: true, message: 'Consultation deleted' })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('DELETE Error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
