const express = require('express')
const axios = require('axios')
require('dotenv').config()

const router = express.Router()

// Endpoint para obtener información de incrustación
router.get('/embed-info', async (req, res) => {
  try {
    const tenantId = process.env.TENANT_ID
    const clientId = process.env.CLIENT_ID
    const clientSecret = process.env.CLIENT_SECRET
    const reportId = '77ec7ecf-66b2-4797-a525-41423e962abc'
    const groupId = process.env.PBI_GROUP_ID

    // Obtener token de acceso
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://analysis.windows.net/powerbi/api/.default'
      })
    )

    const accessToken = tokenResponse.data.access_token

    // Obtener token de incrustación
    const embedTokenResponse = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`,
      {
        accessLevel: 'View',
        allowSaveAs: false
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${reportId}&autoAuth=true&ctid=${tenantId}`
    
    res.json({
      accessToken: embedTokenResponse.data.token,
      embedUrl,
      reportId
    })
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
    res.status(500).json({ 
      error: 'Error al obtener datos de Power BI',
      details: error.response?.data || error.message
    })
  }
})

module.exports = router