import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

// Health check endpoint
app.get('/make-server-b92bafb3/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    server: 'vaccination-tracking-system' 
  });
});

// Helper function to generate certificate ID
function generateCertId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `VAX-${year}${month}${day}-${random}`;
}

// Helper function to send email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!apiKey) {
    console.error('RESEND_API_KEY environment variable is not set');
    return false;
  }

  // Check if it's the placeholder key
  if (apiKey === 'your-api-key-here' || apiKey.length < 10) {
    console.error('RESEND_API_KEY is not properly configured. Please add your actual Resend API key.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Vaccination System <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Email sending error:', responseData);
      return false;
    }

    console.log('Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Register a new vaccination record
app.post('/make-server-b92bafb3/vaccinations', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, age, gender, state, district, vaccineType, dose, dateAdministered, administeringOfficer, latitude, longitude } = body;

    if (!name || !email || !state || !district || !vaccineType || !dose || !dateAdministered) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Auto-generate certificate ID
    let certId = generateCertId();
    let attempts = 0;
    
    // Ensure uniqueness (max 10 attempts)
    while (attempts < 10) {
      const existing = await kv.get(`vaccination:${certId}`);
      if (!existing) break;
      certId = generateCertId();
      attempts++;
    }

    if (attempts >= 10) {
      return c.json({ error: 'Failed to generate unique certificate ID' }, 500);
    }

    const record = {
      certId,
      name,
      email,
      age: age || null,
      gender: gender || null,
      state,
      district,
      latitude: latitude || null,
      longitude: longitude || null,
      vaccineType,
      dose,
      dateAdministered,
      administeringOfficer: administeringOfficer || null,
      createdAt: new Date().toISOString()
    };

    await kv.set(`vaccination:${certId}`, record);

    // Update state stats
    const stateKey = `state:${state}`;
    const stateStats = await kv.get(stateKey) || { state, count: 0 };
    stateStats.count += 1;
    await kv.set(stateKey, stateStats);

    // Update district stats
    const districtKey = `district:${state}:${district}`;
    const districtStats = await kv.get(districtKey) || { state, district, count: 0 };
    districtStats.count += 1;
    await kv.set(districtKey, districtStats);

    // Send confirmation email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .cert-id { font-size: 24px; font-weight: bold; color: #4F46E5; text-align: center; padding: 15px; background: white; border-radius: 8px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; width: 150px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Vaccination Registration Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Your vaccination has been successfully registered in our system.</p>
              
              <div class="cert-id">
                Certificate ID: ${certId}
              </div>
              
              <p><strong>Please save this Certificate ID for future reference.</strong> You will need it to retrieve your vaccination certificate.</p>
              
              <div class="details">
                <h3>Vaccination Details</h3>
                <div class="detail-row">
                  <div class="detail-label">Name:</div>
                  <div>${name}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Vaccine Type:</div>
                  <div>${vaccineType}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Dose:</div>
                  <div>${dose === 'Booster' ? 'Booster' : `Dose ${dose}`}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Date:</div>
                  <div>${new Date(dateAdministered).toLocaleDateString()}</div>
                </div>
                <div class="detail-row">
                  <div class="detail-label">Location:</div>
                  <div>${district}, ${state}</div>
                </div>
                ${administeringOfficer ? `
                <div class="detail-row">
                  <div class="detail-label">Officer:</div>
                  <div>${administeringOfficer}</div>
                </div>
                ` : ''}
              </div>
              
              <p style="margin-top: 20px;">You can retrieve your vaccination certificate anytime using your Certificate ID.</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; 2026 Vaccination Tracking System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email (don't block the response if email fails)
    sendEmail(email, 'Vaccination Registration Confirmation', emailHtml).catch(err => {
      console.error('Email sending failed but continuing:', err);
    });

    return c.json({ success: true, certId, record }, 201);
  } catch (error) {
    console.error('Error creating vaccination record:', error);
    return c.json({ error: 'Failed to create vaccination record', details: String(error) }, 500);
  }
});

// Get vaccination record by certificate ID
app.get('/make-server-b92bafb3/vaccinations/:certId', async (c) => {
  try {
    const certId = c.req.param('certId');
    const record = await kv.get(`vaccination:${certId}`);

    if (!record) {
      return c.json({ error: 'Certificate not found' }, 404);
    }

    return c.json({ success: true, record });
  } catch (error) {
    console.error('Error retrieving vaccination record:', error);
    return c.json({ error: 'Failed to retrieve vaccination record', details: String(error) }, 500);
  }
});

// Get dashboard statistics
app.get('/make-server-b92bafb3/dashboard', async (c) => {
  try {
    // Get all vaccination records
    const vaccinations = await kv.getByPrefix('vaccination:');
    
    // Get all state stats
    const stateStats = await kv.getByPrefix('state:');
    
    // Get all district stats
    const districtStats = await kv.getByPrefix('district:');

    // Calculate statistics
    const totalVaccinations = vaccinations.length;
    const vaccineTypes = {};
    const doseDistribution = { '1': 0, '2': 0, '3': 0, 'Booster': 0 };
    const monthlyData = {};

    vaccinations.forEach((record) => {
      // Vaccine types
      vaccineTypes[record.vaccineType] = (vaccineTypes[record.vaccineType] || 0) + 1;

      // Dose distribution
      const doseKey = String(record.dose);
      if (doseDistribution[doseKey] !== undefined) {
        doseDistribution[doseKey] += 1;
      }

      // Monthly data
      if (record.dateAdministered) {
        const month = record.dateAdministered.substring(0, 7); // YYYY-MM
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
    });

    // Prepare state heatmap data
    const stateHeatmapData = stateStats.map(stat => ({
      state: stat.state,
      count: stat.count
    }));

    // Prepare district heatmap data
    const districtHeatmapData = districtStats.map(stat => ({
      state: stat.state,
      district: stat.district,
      count: stat.count
    }));

    return c.json({
      success: true,
      stats: {
        totalVaccinations,
        vaccineTypes,
        doseDistribution,
        monthlyData,
        stateHeatmapData,
        districtHeatmapData
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return c.json({ error: 'Failed to fetch dashboard data', details: String(error) }, 500);
  }
});

// Get all vaccination records (for admin list view)
app.get('/make-server-b92bafb3/vaccinations', async (c) => {
  try {
    const vaccinations = await kv.getByPrefix('vaccination:');
    return c.json({ success: true, records: vaccinations });
  } catch (error) {
    console.error('Error fetching vaccination records:', error);
    return c.json({ error: 'Failed to fetch vaccination records', details: String(error) }, 500);
  }
});

// Delete a vaccination record
app.delete('/make-server-b92bafb3/vaccinations/:certId', async (c) => {
  try {
    const certId = c.req.param('certId');
    const record = await kv.get(`vaccination:${certId}`);

    if (!record) {
      return c.json({ error: 'Certificate not found' }, 404);
    }

    // Delete the vaccination record
    await kv.del(`vaccination:${certId}`);

    // Update state stats
    const stateKey = `state:${record.state}`;
    const stateStats = await kv.get(stateKey);
    if (stateStats && stateStats.count > 0) {
      stateStats.count -= 1;
      if (stateStats.count === 0) {
        await kv.del(stateKey);
      } else {
        await kv.set(stateKey, stateStats);
      }
    }

    // Update district stats
    const districtKey = `district:${record.state}:${record.district}`;
    const districtStats = await kv.get(districtKey);
    if (districtStats && districtStats.count > 0) {
      districtStats.count -= 1;
      if (districtStats.count === 0) {
        await kv.del(districtKey);
      } else {
        await kv.set(districtKey, districtStats);
      }
    }

    return c.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting vaccination record:', error);
    return c.json({ error: 'Failed to delete vaccination record', details: String(error) }, 500);
  }
});

// Bulk insert vaccination records (for dummy data)
app.post('/make-server-b92bafb3/vaccinations/bulk', async (c) => {
  try {
    const body = await c.req.json();
    const records = body.records;

    if (!Array.isArray(records)) {
      return c.json({ error: 'Records must be an array' }, 400);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const recordData of records) {
      try {
        const { certId, name, age, gender, state, district, vaccineType, dose, dateAdministered, administeringOfficer, latitude, longitude } = recordData;

        // Check if already exists
        const existing = await kv.get(`vaccination:${certId}`);
        if (existing) {
          errorCount++;
          continue;
        }

        const record = {
          certId,
          name,
          age: age || null,
          gender: gender || null,
          state,
          district,
          latitude: latitude || null,
          longitude: longitude || null,
          vaccineType,
          dose,
          dateAdministered,
          administeringOfficer: administeringOfficer || null,
          createdAt: new Date().toISOString()
        };

        await kv.set(`vaccination:${certId}`, record);

        // Update state stats
        const stateKey = `state:${state}`;
        const stateStats = await kv.get(stateKey) || { state, count: 0 };
        stateStats.count += 1;
        await kv.set(stateKey, stateStats);

        // Update district stats
        const districtKey = `district:${state}:${district}`;
        const districtStats = await kv.get(districtKey) || { state, district, count: 0 };
        districtStats.count += 1;
        await kv.set(districtKey, districtStats);

        successCount++;
      } catch (err) {
        errorCount++;
        console.error('Error inserting record:', err);
      }
    }

    return c.json({ 
      success: true, 
      message: `Inserted ${successCount} records, ${errorCount} errors` 
    });
  } catch (error) {
    console.error('Error bulk inserting vaccination records:', error);
    return c.json({ error: 'Failed to bulk insert vaccination records', details: String(error) }, 500);
  }
});

console.log('🚀 VaxTrack Server Started Successfully!');
console.log('📧 Email service:', Deno.env.get('RESEND_API_KEY') ? 'Configured ✅' : 'Not configured ⚠️');

Deno.serve(app.fetch);