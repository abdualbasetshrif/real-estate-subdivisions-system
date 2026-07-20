const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const INDEX_FILE = path.join(__dirname, 'index.html');
const IPHONE_FILE = path.join(__dirname, 'iphone.html');
const LOG_FILE = path.join(__dirname, 'server.log');
const DB_FILE = path.join(__dirname, 'db.json');

try {
    fs.writeFileSync(LOG_FILE, `[${new Date().toISOString()}] Server logging initialized.\n`);
} catch(e) {}

function writeLog(msg) {
    const ts = new Date().toISOString();
    const line = `[${ts}] ${msg}\n`;
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, line);
    } catch(e) {}
}

// -------------------------------------------------------------
// SCRIPT-BASED DATABASE STORAGE
// -------------------------------------------------------------
let db = {
    users: [],
    subdivisions: [],
    plots: [],
    expenses: [],
    investors: [],
    devPartners: [],
    messages: [],
    follows: []
};

function loadDB() {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            db = JSON.parse(data);
            writeLog(`[DB] Database loaded successfully. Users: ${db.users.length}, Subdivisions: ${db.subdivisions.length}, Plots: ${db.plots.length}`);
        } else {
            // Seed default database values for demonstration
            seedDB();
            saveDB();
            writeLog(`[DB] New database seeded and created.`);
        }
    } catch (e) {
        writeLog(`[DB] Error loading database: ${e.message}`);
    }
}

function saveDB() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
        writeLog(`[DB] Error saving database: ${e.message}`);
    }
}

function seedDB() {
    // Seed Developers (Owners)
    db.users.push({
        id: "dev_1",
        username: "admin",
        password: "123", // Plain text for simplicity, as requested
        role: "developer",
        companyName: "بسيط للتطوير العقاري",
        phone: "0912345678",
        subscriptionType: "premium",
        followedSubdivisions: []
    });

    // Seed Brokers
    db.users.push({
        id: "broker_1",
        username: "broker",
        password: "123",
        role: "broker",
        companyName: "مكتب وساطة المدينة",
        phone: "0921112233",
        subscriptionType: "basic",
        followedSubdivisions: []
    });

    // Seed Subdivision
    db.subdivisions.push({
        id: "sub_1",
        developerId: "dev_1",
        name: "مخطط عين زارة النموذجي",
        grossArea: 45000,
        roadArea: 8000,
        address: "طرابلس - عين زارة"
    });

    // Seed Marketing Agent
    db.users.push({
        id: "agent_1",
        username: "agent",
        password: "123",
        role: "agent",
        developerId: "dev_1",
        subdivisionId: "sub_1",
        companyName: "وكيل تسويق عين زارة",
        phone: "0934445566",
        subscriptionType: "agent"
    });

    // Seed some plots
    db.plots.push({
        id: "plot_sub_1_1",
        subdivisionId: "sub_1",
        plotDisplayId: 1,
        area: 250,
        facade: "شمالية",
        nEast: { type: 'neighbor', name: '44', phone: '' },
        nWest: { type: 'street', name: 'شارع 12م', phone: '' },
        nNorth: { type: 'neighbor', name: '5', phone: '' },
        nSouth: { type: 'neighbor', name: '6', phone: '' },
        received: 35000,
        remaining: 0,
        reserved: false,
        reservorPhone: "",
        ownerName: "علي مسعود الورفلي",
        ownerPhone: "0915558899",
        brokerName: "",
        brokerPhone: "",
        soldByAgentId: null,
        divisions: []
    });

    db.plots.push({
        id: "plot_sub_1_2",
        subdivisionId: "sub_1",
        plotDisplayId: 2,
        area: 300,
        facade: "شرقية",
        nEast: { type: 'street', name: 'شارع 15م', phone: '' },
        nWest: { type: 'neighbor', name: '1', phone: '' },
        nNorth: { type: 'neighbor', name: '3', phone: '' },
        nSouth: { type: 'neighbor', name: '4', phone: '' },
        received: 20000,
        remaining: 25000,
        reserved: false,
        reservorPhone: "",
        ownerName: "سالم فتحي الجعفري",
        ownerPhone: "0926667788",
        brokerName: "مكتب المدينة",
        brokerPhone: "0921112233",
        soldByAgentId: "agent_1",
        installmentPlan: {
            enabled: true,
            downpaymentPercent: 44,
            downpaymentAmount: 20000,
            durationYears: 1,
            frequency: "monthly",
            startDate: "2026-08-01",
            schedule: [
                { number: 1, dueDate: "2026-08-01", amount: 2083.3, status: "paid" },
                { number: 2, dueDate: "2026-09-01", amount: 2083.3, status: "pending" },
                { number: 3, dueDate: "2026-10-01", amount: 2083.3, status: "pending" },
                { number: 4, dueDate: "2026-11-01", amount: 2083.3, status: "pending" },
                { number: 5, dueDate: "2026-12-01", amount: 2083.3, status: "pending" },
                { number: 6, dueDate: "2027-01-01", amount: 2083.3, status: "pending" },
                { number: 7, dueDate: "2027-02-01", amount: 2083.3, status: "pending" },
                { number: 8, dueDate: "2027-03-01", amount: 2083.3, status: "pending" },
                { number: 9, dueDate: "2027-04-01", amount: 2083.3, status: "pending" },
                { number: 10, dueDate: "2027-05-01", amount: 2083.3, status: "pending" },
                { number: 11, dueDate: "2027-06-01", amount: 2083.3, status: "pending" },
                { number: 12, dueDate: "2027-07-01", amount: 2083.3, status: "pending" }
            ]
        },
        divisions: []
    });

    db.plots.push({
        id: "plot_sub_1_3",
        subdivisionId: "sub_1",
        plotDisplayId: 3,
        area: 280,
        facade: "غربية",
        nEast: { type: 'neighbor', name: '2', phone: '' },
        nWest: { type: 'street', name: 'شارع 10م', phone: '' },
        nNorth: { type: 'neighbor', name: '8', phone: '' },
        nSouth: { type: 'neighbor', name: '7', phone: '' },
        received: 0,
        remaining: 0,
        reserved: false,
        reservorPhone: "",
        ownerName: "",
        ownerPhone: "",
        brokerName: "",
        brokerPhone: "",
        soldByAgentId: null,
        divisions: []
    });
}

loadDB();

// -------------------------------------------------------------
// ROUTER & HELPER FUNCTIONS
// -------------------------------------------------------------
function parseRequestBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            resolve(body);
        });
    });
}

function sendJSON(res, status, data) {
    res.writeHead(status, { 
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function getUserFromToken(token) {
    if (!token) return null;
    return db.users.find(u => u.id === token) || null;
}

// Obfuscate sold plots according to user role to protect financial and private details
function obfuscatePlotsList(plotsList, user) {
    if (!user) return [];
    
    // Developer gets full access
    if (user.role === 'developer') {
        return plotsList;
    }
    
    // Approved agent gets full access
    if (user.role === 'agent' && user.agentType === 'approved') {
        return plotsList;
    }
    
    // Marketing Agent / Broker obfuscation
    return plotsList.map(plot => {
        // Did they sell/enter this plot?
        const isSoldByThisAgent = user.role === 'agent' && plot.soldByAgentId === user.id;
        
        if (isSoldByThisAgent) {
            // Full access to plots they entered/sold!
            return plot;
        }
        
        // Otherwise, obfuscate EVERYTHING except plotDisplayId, area, status
        const isSold = !!plot.ownerName;
        const isReserved = !!plot.reserved;
        
        const obfuscated = {
            id: plot.id,
            subdivisionId: plot.subdivisionId,
            plotDisplayId: plot.plotDisplayId,
            area: plot.area,
            
            // Set status indicators but clear values
            reserved: isReserved,
            reservorPhone: "",
            ownerName: isSold ? "تم البيع" : "",
            ownerPhone: "",
            
            received: 0,
            remaining: 0,
            
            // Clear secret data
            facade: "داخلية",
            facadeCount: 0,
            nEast: { type: 'neighbor', name: 'محجوب', phone: '' },
            nWest: { type: 'neighbor', name: 'محجوب', phone: '' },
            nNorth: { type: 'neighbor', name: 'محجوب', phone: '' },
            nSouth: { type: 'neighbor', name: 'محجوب', phone: '' },
            brokerName: "",
            brokerPhone: "",
            installmentPlan: null,
            isPreActivationSale: plot.isPreActivationSale || false,
            soldByAgentId: plot.soldByAgentId || null
        };
        
        if (plot.divisions && plot.divisions.length > 0) {
            obfuscated.divisions = plot.divisions.map(div => {
                const divIsSold = !!div.ownerName;
                const divIsSoldByThisAgent = user.role === 'agent' && div.soldByAgentId === user.id;
                
                if (divIsSoldByThisAgent) {
                    return div;
                }
                
                return {
                    id: div.id,
                    area: div.area,
                    reserved: !!div.reserved,
                    reservorPhone: "",
                    ownerName: divIsSold ? "تم البيع" : "",
                    ownerPhone: "",
                    received: 0,
                    remaining: 0,
                    facade: "داخلية",
                    nEast: { type: 'neighbor', name: 'محجوب', phone: '' },
                    nWest: { type: 'neighbor', name: 'محجوب', phone: '' },
                    nNorth: { type: 'neighbor', name: 'محجوب', phone: '' },
                    nSouth: { type: 'neighbor', name: 'محجوب', phone: '' },
                    brokerName: "",
                    brokerPhone: "",
                    isPreActivationSale: div.isPreActivationSale || false,
                    soldByAgentId: div.soldByAgentId || null
                };
            });
        }
        
        return obfuscated;
    });
}

// -------------------------------------------------------------
// MAIN SERVER HANDLER
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
    // OPTIONS Preflight request handler
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const token = req.headers['authorization'];
    const currentUser = getUserFromToken(token);

    writeLog(`[HTTP] ${req.method} ${pathname} (User: ${currentUser ? currentUser.username + ' [' + currentUser.role + ']' : 'Guest'})`);

    // ---------------------------------------------------------
    // API FOR VISION ANALYZING SKETCH MAPS (ORIGINAL PROXY API)
    // ---------------------------------------------------------
    if (pathname === '/api/analyze' && req.method === 'POST') {
        writeLog(`[Proxy] Received analysis request. Header Content-Length: ${req.headers['content-length']}`);
        try {
            const body = await parseRequestBody(req);
            writeLog(`[Proxy] Finished buffering request body. Size: ${body.length} chars. Parsing JSON...`);
            const payload = JSON.parse(body);
            const { apiKey, imageBase64, mediaType } = payload;
            
            if (!apiKey) {
                writeLog(`[Proxy] Error: API Key is missing.`);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'مفتاح API مطلوب للتحليل' }));
                return;
            }

            // 1. Detect API Key Type Automatically
            let keyType = 'gemini';
            if (apiKey.startsWith('sk-or-')) {
                keyType = 'openrouter';
            } else if (apiKey.startsWith('sk-ant-')) {
                keyType = 'anthropic';
            } else if (apiKey.startsWith('sk-')) {
                keyType = 'openai';
            } else if (apiKey.startsWith('AIzaSy')) {
                keyType = 'gemini';
            } else if (apiKey.length > 30) {
                keyType = 'gemini';
            } else {
                keyType = 'gemini';
            }

            const systemPrompt = `You are a professional cartographer and real estate land surveyor.
Analyze the uploaded plot drawing / sketch map and extract the total gross area, road area, and geometric layout of all plots.
Output ONLY a valid JSON object. Do NOT include any markdown formatting, backticks, or conversational text. Just the raw JSON object.
The JSON object must have the following fields at the root level:
- grossArea: number (the total gross area of the subdivision/project in square meters, e.g. 35000. If NOT explicitly written or visible in the drawing, set this to 0)
- roadArea: number (the total road area taken in the project in square meters, e.g. 5000. If NOT explicitly written or visible in the drawing, set this to 0)
- plots: array of objects representing individual plots.

Each plot object in the array must have the following fields:
- id: number (the number of the plot/piece, e.g. 43. It MUST be an integer)
- area: number (the net area of the plot in square meters, e.g. 250.5. Must be a clean number)
- facade: string (the facade direction in Arabic, e.g. "شرقية", "شمالية", "جنوبية غربية" based on the streets they face)
- nEastName: string (the neighbor to the east, either another plot like "44" or a street like "شارع 16م")
- nWestName: string (the neighbor to the west, either another plot like "42" or a street)
- nNorthName: string (the neighbor to the north, either another plot like "5" or a street)
- nSouthName: string (the neighbor to the south, either another plot like "38" or a street)

Example Output Format:
{
  "grossArea": 35000,
  "roadArea": 5000,
  "plots": [
    {"id": 43, "area": 250.5, "facade": "شرقية", "nEastName": "44", "nWestName": "42", "nNorthName": "طريق 16م", "nSouthName": "38"}
  ]
}`;

            // 2. Route request to appropriate AI provider
            if (keyType === 'openrouter') {
                writeLog(`[Proxy] Routing request to OpenRouter...`);
                const orModels = [
                    // Premium models (try first if paid key)
                    'anthropic/claude-3.5-sonnet',
                    'openai/gpt-4o',
                    'google/gemini-2.5-pro',
                    // Fallback to free/cheap models
                    'google/gemini-2.5-flash',
                    'google/gemini-2.0-flash',
                    'openai/gpt-4o-mini',
                    'google/gemini-2.0-flash-exp:free',
                    'google/gemini-2.5-flash:free',
                    'openrouter/free'
                ];
                let currentModelIdx = 0;

                function tryNextOpenRouterModel() {
                    if (res.headersSent) return;
                    if (currentModelIdx >= orModels.length) {
                        writeLog(`[Proxy] All OpenRouter model attempts failed.`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'عذراً، فشلت جميع محاولات معالجة الصورة عبر النماذج المتوفرة في OpenRouter.' }));
                        return;
                    }
                    const model = orModels[currentModelIdx];
                    writeLog(`[Proxy] OpenRouter Attempt #${currentModelIdx + 1}: trying model ${model}...`);
                    
                    let nextCalled = false;
                    function callNextOR() {
                        if (nextCalled) return;
                        nextCalled = true;
                        currentModelIdx++;
                        tryNextOpenRouterModel();
                    }

                    const orPayload = JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: `${systemPrompt}\nExtract the plot details from this drawing. Output only the JSON array.` },
                                    { type: 'image_url', image_url: { url: `data:${mediaType || 'image/png'};base64,${imageBase64}` } }
                                ]
                            }
                        ]
                    });

                    const apiReq = https.request({
                        hostname: 'openrouter.ai',
                        path: '/api/v1/chat/completions',
                        method: 'POST',
                        timeout: 50000,
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(orPayload)
                        }
                    }, (apiRes) => {
                        let apiData = '';
                        apiRes.on('data', d => apiData += d.toString());
                        apiRes.on('end', () => {
                            if (res.headersSent) return;
                            writeLog(`[Proxy] OpenRouter Response [model=${model}]: Status=${apiRes.statusCode} Body=${apiData}`);
                            try {
                                const orJson = JSON.parse(apiData);
                                writeLog(`[Proxy] OpenRouter response body for ${model}: ${apiData}`);
                                // If 200 OK and valid choices, return it!
                                if (apiRes.statusCode === 200 && orJson.choices && orJson.choices[0] && orJson.choices[0].message) {
                                    const extractedText = orJson.choices[0].message.content.trim();
                                    writeLog(`[Proxy] OpenRouter successfully analyzed using ${model}!`);
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ content: [{ text: extractedText }] }));
                                } else {
                                    writeLog(`[Proxy] OpenRouter model ${model} returned status ${apiRes.statusCode} or empty data. Trying next fallback model...`);
                                    callNextOR();
                                }
                            } catch (err) {
                                writeLog(`[Proxy] OpenRouter model ${model} parse error. Trying next fallback model...`);
                                callNextOR();
                            }
                        });
                    });

                    apiReq.on('timeout', () => { writeLog(`[Proxy] OpenRouter model ${model} timeout.`); apiReq.destroy(); callNextOR(); });
                    apiReq.on('error', (e) => { writeLog(`[Proxy] OpenRouter model ${model} error: ${e.message}`); callNextOR(); });
                    apiReq.write(orPayload);
                    apiReq.end();
                }

                tryNextOpenRouterModel();

            } else if (keyType === 'gemini') {
                writeLog(`[Proxy] Routing request to Google Gemini API...`);
                const geminiPayload = JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: `${systemPrompt}\nAnalyze the attached image and extract all plots in the exact JSON format.` },
                                { inlineData: { mimeType: mediaType || 'image/png', data: imageBase64 } }
                            ]
                        }
                    ]
                });

                const geminiAttempts = [
                    { model: 'gemini-2.5-pro', version: 'v1beta' },
                    { model: 'gemini-2.5-flash', version: 'v1' },
                    { model: 'gemini-2.5-flash', version: 'v1beta' },
                    { model: 'gemini-2.0-flash', version: 'v1' },
                    { model: 'gemini-2.0-flash', version: 'v1beta' },
                    { model: 'gemini-1.5-pro', version: 'v1' },
                    { model: 'gemini-1.5-flash', version: 'v1' }
                ];
                let currentAttempt = 0;

                function tryNextGeminiModel() {
                    if (res.headersSent) return;
                    if (currentAttempt >= geminiAttempts.length) {
                        writeLog(`[Proxy] All Gemini model attempts failed.`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'عذراً، جميع محاولات الاتصال بنماذج Gemini باءت بالفشل.' }));
                        return;
                    }
                    const { model, version } = geminiAttempts[currentAttempt];
                    writeLog(`[Proxy] Gemini Attempt #keyType ${currentAttempt + 1}: Model=${model}...`);

                    let nextCalled = false;
                    function callNext() {
                        if (nextCalled) return;
                        nextCalled = true;
                        currentAttempt++;
                        tryNextGeminiModel();
                    }

                    const apiReq = https.request({
                        hostname: 'generativelanguage.googleapis.com',
                        path: `/${version}/models/${model}:generateContent?key=${apiKey}`,
                        method: 'POST',
                        timeout: 40000,
                        headers: {
                            'content-type': 'application/json',
                            'content-length': Buffer.byteLength(geminiPayload)
                        }
                    }, (apiRes) => {
                        let apiData = '';
                        apiRes.on('data', d => apiData += d.toString());
                        apiRes.on('end', () => {
                            if (res.headersSent) return;
                            try {
                                const geminiJson = JSON.parse(apiData);
                                const isRetryable = apiRes.statusCode === 404 || apiRes.statusCode === 429 || apiRes.statusCode === 403 ||
                                    (geminiJson.error && (geminiJson.error.status === 'NOT_FOUND' || geminiJson.error.status === 'RESOURCE_EXHAUSTED' || geminiJson.error.status === 'PERMISSION_DENIED'));
                                if (isRetryable) {
                                    writeLog(`[Proxy] Gemini model keyType ${model} failed (code ${apiRes.statusCode}). Trying fallback...`);
                                    callNext();
                                } else if (apiRes.statusCode === 200 && geminiJson.candidates && geminiJson.candidates[0] && geminiJson.candidates[0].content && geminiJson.candidates[0].content.parts && geminiJson.candidates[0].content.parts[0]) {
                                    writeLog(`[Proxy] Gemini successfully analyzed using ${model}!`);
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ content: [{ text: geminiJson.candidates[0].content.parts[0].text }] }));
                                } else {
                                    writeLog(`[Proxy] Gemini model ${model} response not formatted correctly. Code: ${apiRes.statusCode}`);
                                    callNext();
                                }
                            } catch (err) {
                                writeLog(`[Proxy] Gemini model ${model} parse error. Trying fallback...`);
                                callNext();
                            }
                        });
                    });

                    apiReq.on('timeout', () => { writeLog(`[Proxy] Gemini ${model} timeout.`); apiReq.destroy(); callNext(); });
                    apiReq.on('error', (e) => { writeLog(`[Proxy] Gemini ${model} error: ${e.message}`); callNext(); });
                    apiReq.write(geminiPayload);
                    apiReq.end();
                }

                tryNextGeminiModel();

            } else if (keyType === 'openai') {
                writeLog(`[Proxy] Routing request to OpenAI API...`);
                const openaiModels = ['gpt-4o', 'gpt-4o-mini'];
                let currentOpenaiIdx = 0;

                function tryNextOpenaiModel() {
                    if (res.headersSent) return;
                    if (currentOpenaiIdx >= openaiModels.length) {
                        writeLog(`[Proxy] All OpenAI model attempts failed.`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'عذراً، فشلت محاولات التحليل عبر نماذج OpenAI.' }));
                        return;
                    }
                    const model = openaiModels[currentOpenaiIdx];
                    writeLog(`[Proxy] OpenAI Attempt #${currentOpenaiIdx + 1}: trying model ${model}...`);

                    let nextCalled = false;
                    function callNextOpenai() {
                        if (nextCalled) return;
                        nextCalled = true;
                        currentOpenaiIdx++;
                        tryNextOpenaiModel();
                    }

                    const openaiPayload = JSON.stringify({
                        model: model,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: `${systemPrompt}\nExtract the plot details from this drawing. Output only the JSON array.` },
                                    { type: 'image_url', image_url: { url: `data:${mediaType || 'image/png'};base64,${imageBase64}` } }
                                ]
                            }
                        ]
                    });

                    const apiReq = https.request({
                        hostname: 'api.openai.com',
                        path: '/v1/chat/completions',
                        method: 'POST',
                        timeout: 50000,
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(openaiPayload)
                        }
                    }, (apiRes) => {
                        let apiData = '';
                        apiRes.on('data', d => apiData += d.toString());
                        apiRes.on('end', () => {
                            if (res.headersSent) return;
                            try {
                                const oaJson = JSON.parse(apiData);
                                if (apiRes.statusCode === 200 && oaJson.choices && oaJson.choices[0] && oaJson.choices[0].message) {
                                    const extractedText = oaJson.choices[0].message.content.trim();
                                    writeLog(`[Proxy] OpenAI successfully analyzed using ${model}!`);
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ content: [{ text: extractedText }] }));
                                } else {
                                    writeLog(`[Proxy] OpenAI model ${model} failed (code keyType ${apiRes.statusCode}). Trying fallback...`);
                                    callNextOpenai();
                                }
                            } catch (err) {
                                callNextOpenai();
                            }
                        });
                    });

                    apiReq.on('timeout', () => { apiReq.destroy(); callNextOpenai(); });
                    apiReq.on('error', () => { callNextOpenai(); });
                    apiReq.write(openaiPayload);
                    apiReq.end();
                }

                tryNextOpenaiModel();

            } else { // Anthropic keyType === 'anthropic'
                writeLog(`[Proxy] Routing request to Anthropic Claude API...`);
                const anthropicModels = [
                    'claude-3-5-sonnet-20241022',
                    'claude-3-5-haiku-20241022',
                    'claude-3-5-sonnet-20240620'
                ];
                let currentClaudeIdx = 0;

                function tryNextClaudeModel() {
                    if (res.headersSent) return;
                    if (currentClaudeIdx >= anthropicModels.length) {
                        writeLog(`[Proxy] All Anthropic Claude model attempts failed.`);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'عذراً، فشلت محاولات التحليل عبر نماذج Anthropic Claude.' }));
                        return;
                    }
                    const model = anthropicModels[currentClaudeIdx];
                    writeLog(`[Proxy] Anthropic Attempt #keyType ${currentClaudeIdx + 1}: trying model ${model}...`);

                    let nextCalled = false;
                    function callNextClaude() {
                        if (nextCalled) return;
                        nextCalled = true;
                        currentClaudeIdx++;
                        tryNextClaudeModel();
                    }

                    const anthropicPayload = JSON.stringify({
                        model: model,
                        max_tokens: 4000,
                        system: systemPrompt,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/png', data: imageBase64 } },
                                    { type: 'text', text: 'Extract the plot details from this drawing. Output only the JSON array.' }
                                ]
                            }
                        ]
                    });

                    const apiReq = https.request({
                        hostname: 'api.anthropic.com',
                        path: '/v1/messages',
                        method: 'POST',
                        timeout: 60000,
                        headers: {
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json',
                            'content-length': Buffer.byteLength(anthropicPayload)
                        }
                    }, (apiRes) => {
                        let apiData = '';
                        apiRes.on('data', d => apiData += d.toString());
                        apiRes.on('end', () => {
                            if (res.headersSent) return;
                            try {
                                const claudeJson = JSON.parse(apiData);
                                if (apiRes.statusCode === 200 && claudeJson.content && claudeJson.content[0] && claudeJson.content[0].text) {
                                    writeLog(`[Proxy] Anthropic successfully analyzed using ${model}!`);
                                    res.writeHead(200, { 'Content-Type': 'application/json' });
                                    res.end(JSON.stringify({ content: [{ text: claudeJson.content[0].text }] }));
                                } else {
                                    writeLog(`[Proxy] Anthropic model ${model} failed (code keyType ${apiRes.statusCode}). Trying fallback...`);
                                    callNextClaude();
                                }
                            } catch (err) {
                                callNextClaude();
                            }
                        });
                    });

                    apiReq.on('timeout', () => { apiReq.destroy(); callNextClaude(); });
                    apiReq.on('error', () => { callNextClaude(); });
                    apiReq.write(anthropicPayload);
                    apiReq.end();
                }

                tryNextClaudeModel();
            }
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message }));
        }
        return;
    }
    
    if (pathname === '/api/auth/register' && req.method === 'POST') {
        const body = await parseRequestBody(req);
        try {
            const { username, password, role, companyName, phone } = JSON.parse(body);
            if (!username || !password || !role) {
                return sendJSON(res, 400, { error: "يرجى تعبئة الحقول الأساسية المطلوبة" });
            }
            if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
                return sendJSON(res, 400, { error: "اسم المستخدم هذا مسجل مسبقاً" });
            }
            const newUser = {
                id: "user_" + Date.now(),
                username: username.trim(),
                password: password.trim(),
                role: role,
                companyName: companyName ? companyName.trim() : "",
                phone: phone ? phone.trim() : "",
                subscriptionType: role === "developer" ? "premium" : "basic",
                followedSubdivisions: []
            };
            db.users.push(newUser);
            saveDB();
            sendJSON(res, 201, { success: true, token: newUser.id, user: newUser });
        } catch (e) {
            sendJSON(res, 400, { error: "خطأ في قراءة مدخلات التسجيل" });
        }
        return;
    }

    if (pathname === '/api/auth/login' && req.method === 'POST') {
        const body = await parseRequestBody(req);
        try {
            const { username, password } = JSON.parse(body);
            const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password.trim());
            if (!user) {
                return sendJSON(res, 401, { error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
            }
            sendJSON(res, 200, { success: true, token: user.id, user: user });
        } catch (e) {
            sendJSON(res, 400, { error: "خطأ في قراءة مدخلات تسجيل الدخول" });
        }
        return;
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
        if (!currentUser) {
            return sendJSON(res, 401, { error: "غير مصرح بالدخول" });
        }
        sendJSON(res, 200, { user: currentUser });
        return;
    }

    // ---------------------------------------------------------
    // SUBDIVISIONS APIs
    // ---------------------------------------------------------
    if (pathname === '/api/subdivisions' && req.method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح بالدخول" });
        
        let list = [];
        if (currentUser.role === 'developer') {
            list = db.subdivisions.filter(s => s.developerId === currentUser.id);
        } else if (currentUser.role === 'agent') {
            list = db.subdivisions.filter(s => s.id === currentUser.subdivisionId);
        } else if (currentUser.role === 'broker') {
            // Brokers can view all subdivisions in search console
            list = db.subdivisions;
        }
        sendJSON(res, 200, list);
        return;
    }

    if (pathname === '/api/subdivisions' && req.method === 'POST') {
        if (!currentUser || currentUser.role !== 'developer') {
            return sendJSON(res, 403, { error: "ليس لديك صلاحية لإضافة مقسم جديد" });
        }
        const body = await parseRequestBody(req);
        try {
            const { name, grossArea, roadArea, address, landPurchasePrice, totalLandArea } = JSON.parse(body);
            if (!name) return sendJSON(res, 400, { error: "اسم المقسم مطلوب" });
            const newSub = {
                id: "sub_" + Date.now(),
                developerId: currentUser.id,
                name: name.trim(),
                grossArea: parseFloat(grossArea) || 0,
                roadArea: parseFloat(roadArea) || 0,
                roadDeductionMethod: "proportional",
                address: address ? address.trim() : "",
                landPurchasePrice: landPurchasePrice !== undefined ? parseFloat(landPurchasePrice) || 0 : 800000,
                totalLandArea: totalLandArea !== undefined ? parseFloat(totalLandArea) || 0 : 10000
            };
            db.subdivisions.push(newSub);
            saveDB();
            sendJSON(res, 201, newSub);
        } catch (e) {
            sendJSON(res, 400, { error: "مدخلات غير صالحة" });
        }
        return;
    }

    // Single subdivision operations
    const subMatch = pathname.match(/^\/api\/subdivisions\/([^\/]+)$/);
    if (subMatch) {
        const subId = subMatch[1];
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح بالدخول" });
        
        const sub = db.subdivisions.find(s => s.id === subId);
        if (!sub) return sendJSON(res, 404, { error: "المقسم غير موجود" });

        // Authorization check
        if (currentUser.role === 'developer' && sub.developerId !== currentUser.id) {
            return sendJSON(res, 403, { error: "غير مصرح لك للوصول لهذا المقسم" });
        }
        if (currentUser.role === 'agent' && currentUser.subdivisionId !== subId) {
            return sendJSON(res, 403, { error: "غير مصرح للوكيل بالوصول لهذا المقسم" });
        }

        if (req.method === 'GET') {
            // Get public developer info along with subdivision
            const dev = db.users.find(u => u.id === sub.developerId);
            sendJSON(res, 200, {
                ...sub,
                developerCompanyName: dev ? dev.companyName : "",
                developerPhone: dev ? dev.phone : ""
            });
            return;
        }

        if (req.method === 'PUT') {
            if (currentUser.role !== 'developer') return sendJSON(res, 403, { error: "فقط المطور يحق له التعديل" });
            const body = await parseRequestBody(req);
            try {
                const { name, grossArea, roadArea, roadDeductionMethod, address, landPurchasePrice, totalLandArea } = JSON.parse(body);
                sub.name = name ? name.trim() : sub.name;
                sub.grossArea = grossArea !== undefined ? parseFloat(grossArea) || 0 : sub.grossArea;
                sub.roadArea = roadArea !== undefined ? parseFloat(roadArea) || 0 : sub.roadArea;
                sub.roadDeductionMethod = roadDeductionMethod !== undefined ? roadDeductionMethod.trim() : (sub.roadDeductionMethod || "proportional");
                sub.address = address !== undefined ? address.trim() : sub.address;
                sub.landPurchasePrice = landPurchasePrice !== undefined ? parseFloat(landPurchasePrice) || 0 : (sub.landPurchasePrice || 800000);
                sub.totalLandArea = totalLandArea !== undefined ? parseFloat(totalLandArea) || 0 : (sub.totalLandArea || 10000);
                saveDB();
                sendJSON(res, 200, sub);
            } catch (e) {
                sendJSON(res, 400, { error: "مدخلات التعديل خاطئة" });
            }
            return;
        }

        if (req.method === 'DELETE') {
            if (currentUser.role !== 'developer') return sendJSON(res, 403, { error: "فقط المطور يحق له الحذف" });
            db.subdivisions = db.subdivisions.filter(s => s.id !== subId);
            db.plots = db.plots.filter(p => p.subdivisionId !== subId);
            db.expenses = db.expenses.filter(e => e.subdivisionId !== subId);
            db.investors = db.investors.filter(i => i.subdivisionId !== subId);
            db.devPartners = db.devPartners.filter(dp => dp.subdivisionId !== subId);
            saveDB();
            sendJSON(res, 200, { success: true });
            return;
        }
    }

    // ---------------------------------------------------------
    // PLOTS APIs (Scoped by Subdivision)
    // ---------------------------------------------------------
    const plotsMatch = pathname.match(/^\/api\/subdivisions\/([^\/]+)\/plots$/);
    if (plotsMatch) {
        const subId = plotsMatch[1];
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح" });

        if (req.method === 'GET') {
            const list = db.plots.filter(p => p.subdivisionId === subId);
            const filteredList = obfuscatePlotsList(list, currentUser);
            sendJSON(res, 200, filteredList);
            return;
        }

        if (req.method === 'POST') {
            if (currentUser.role === 'broker') return sendJSON(res, 403, { error: "المكتب الوسيط لا يملك صلاحية الإضافة" });
            const body = await parseRequestBody(req);
            try {
                const payload = JSON.parse(body);
                if (Array.isArray(payload)) {
                    // Bulk sync
                    db.plots = db.plots.filter(p => p.subdivisionId !== subId);
                    
                    const newPlots = payload.map(p => ({
                        id: p.id ? String(p.id) : "plot_" + subId + "_" + Date.now() + "_" + Math.random().toString().slice(-4),
                        subdivisionId: subId,
                        plotDisplayId: p.plotDisplayId || p.id,
                        area: parseFloat(p.area) || 0,
                        facade: p.facade || "داخلية",
                        nEast: p.nEast || { type: 'neighbor', name: '', phone: '' },
                        nWest: p.nWest || { type: 'neighbor', name: '', phone: '' },
                        nNorth: p.nNorth || { type: 'neighbor', name: '', phone: '' },
                        nSouth: p.nSouth || { type: 'neighbor', name: '', phone: '' },
                        received: parseFloat(p.received) || 0,
                        remaining: parseFloat(p.remaining) || 0,
                        reserved: !!p.reserved,
                        reservorPhone: p.reservorPhone || "",
                        ownerName: p.ownerName || "",
                        ownerPhone: p.ownerPhone || "",
                        brokerName: p.brokerName || "",
                        brokerPhone: p.brokerPhone || "",
                        isPreActivationSale: !!p.isPreActivationSale,
                        soldByAgentId: p.soldByAgentId || null,
                        installmentPlan: p.installmentPlan || null,
                        divisions: p.divisions || []
                    }));

                    db.plots.push(...newPlots);
                    saveDB();
                    sendJSON(res, 200, { success: true, count: newPlots.length });
                } else {
                    // Single plot add
                    const p = payload;
                    const newPlot = {
                        id: "plot_" + subId + "_" + Date.now(),
                        subdivisionId: subId,
                        plotDisplayId: p.plotDisplayId || p.id,
                        area: parseFloat(p.area) || 0,
                        facade: p.facade || "داخلية",
                        nEast: p.nEast || { type: 'neighbor', name: '', phone: '' },
                        nWest: p.nWest || { type: 'neighbor', name: '', phone: '' },
                        nNorth: p.nNorth || { type: 'neighbor', name: '', phone: '' },
                        nSouth: p.nSouth || { type: 'neighbor', name: '', phone: '' },
                        received: parseFloat(p.received) || 0,
                        remaining: parseFloat(p.remaining) || 0,
                        reserved: !!p.reserved,
                        reservorPhone: p.reservorPhone || "",
                        ownerName: p.ownerName || "",
                        ownerPhone: p.ownerPhone || "",
                        brokerName: p.brokerName || "",
                        brokerPhone: p.brokerPhone || "",
                        isPreActivationSale: !!p.isPreActivationSale,
                        soldByAgentId: currentUser.role === 'agent' ? currentUser.id : (p.soldByAgentId || null),
                        installmentPlan: p.installmentPlan || null,
                        divisions: p.divisions || []
                    };
                    db.plots.push(newPlot);
                    saveDB();
                    sendJSON(res, 201, newPlot);
                }
            } catch (e) {
                sendJSON(res, 400, { error: "مدخلات إضافة القطعة خاطئة" });
            }
            return;
        }
    }

    // ---------------------------------------------------------
    // EXPENSES APIs (Scoped by Subdivision)
    // ---------------------------------------------------------
    const expMatch = pathname.match(/^\/api\/subdivisions\/([^\/]+)\/expenses$/);
    if (expMatch) {
        const subId = expMatch[1];
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح" });

        if (req.method === 'GET') {
            if (currentUser.role === 'broker') return sendJSON(res, 403, { error: "المكتب لا يملك صلاحية رؤية المصاريف" });
            const list = db.expenses.filter(e => e.subdivisionId === subId);
            sendJSON(res, 200, list);
            return;
        }

        if (req.method === 'POST') {
            if (currentUser.role === 'broker') return sendJSON(res, 403, { error: "المكتب لا يملك صلاحية إضافة مصروفات" });
            const body = await parseRequestBody(req);
            try {
                const list = JSON.parse(body);
                if (Array.isArray(list)) {
                    db.expenses = db.expenses.filter(e => e.subdivisionId !== subId);
                    const newExpenses = list.map(item => ({
                        id: item.id ? String(item.id) : "exp_" + Date.now() + "_" + Math.random().toString().slice(-4),
                        subdivisionId: subId,
                        category: item.category || "",
                        description: item.description || item.category || "",
                        amount: parseFloat(item.amount) || 0,
                        date: item.date || "",
                        notes: item.notes || "",
                        addedByUsername: item.addedByUsername || currentUser.username
                    }));
                    db.expenses.push(...newExpenses);
                    saveDB();
                    sendJSON(res, 200, { success: true });
                } else {
                    const item = list;
                    const newExp = {
                        id: "exp_" + Date.now(),
                        subdivisionId: subId,
                        category: item.category || "",
                        description: item.description || item.category || "",
                        amount: parseFloat(item.amount) || 0,
                        date: item.date || "",
                        notes: item.notes || "",
                        addedByUsername: currentUser.username
                    };
                    db.expenses.push(newExp);
                    saveDB();
                    sendJSON(res, 201, newExp);
                }
            } catch (e) {
                sendJSON(res, 400, { error: "خطأ في معالجة المصروفات" });
            }
            return;
        }
    }

    // ---------------------------------------------------------
    // INVESTORS APIs (Scoped by Subdivision)
    // ---------------------------------------------------------
    const invMatch = pathname.match(/^\/api\/subdivisions\/([^\/]+)\/investors$/);
    if (invMatch) {
        const subId = invMatch[1];
        if (!currentUser || currentUser.role !== 'developer') return sendJSON(res, 403, { error: "صلاحية مطور فقط للمستثمرين" });

        if (req.method === 'GET') {
            const list = db.investors.filter(i => i.subdivisionId === subId);
            sendJSON(res, 200, list);
            return;
        }

        if (req.method === 'POST') {
            const body = await parseRequestBody(req);
            try {
                const list = JSON.parse(body);
                if (Array.isArray(list)) {
                    db.investors = db.investors.filter(i => i.subdivisionId !== subId);
                    const newInv = list.map(item => ({
                        id: item.id ? String(item.id) : "inv_" + Date.now() + "_" + Math.random().toString().slice(-4),
                        subdivisionId: subId,
                        name: item.name,
                        amount: parseFloat(item.amount) || 0,
                        deposits: Array.isArray(item.deposits) ? item.deposits : [],
                        withdrawals: Array.isArray(item.withdrawals) ? item.withdrawals : [],
                        date: item.date
                    }));
                    db.investors.push(...newInv);
                    saveDB();
                    sendJSON(res, 200, { success: true });
                }
            } catch (e) {
                sendJSON(res, 400, { error: "خطأ في مدخلات المستثمرين" });
            }
            return;
        }
    }

    // ---------------------------------------------------------
    // DEVELOPMENT PARTNERS APIs (Scoped by Subdivision)
    // ---------------------------------------------------------
    const dpMatch = pathname.match(/^\/api\/subdivisions\/([^\/]+)\/devpartners$/);
    if (dpMatch) {
        const subId = dpMatch[1];
        if (!currentUser || currentUser.role !== 'developer') return sendJSON(res, 403, { error: "صلاحية مطور فقط لشركاء التطوير" });

        if (req.method === 'GET') {
            const list = db.devPartners.filter(d => d.subdivisionId === subId);
            sendJSON(res, 200, list);
            return;
        }

        if (req.method === 'POST') {
            const body = await parseRequestBody(req);
            try {
                const list = JSON.parse(body);
                if (Array.isArray(list)) {
                    db.devPartners = db.devPartners.filter(d => d.subdivisionId !== subId);
                    const newPartners = list.map(item => ({
                        id: item.id ? String(item.id) : "dp_" + Date.now() + "_" + Math.random().toString().slice(-4),
                        subdivisionId: subId,
                        name: item.name,
                        areaBought: parseFloat(item.areaBought) || 0,
                        unit: item.unit || "m2",
                        purchasePricePerMeter: parseFloat(item.purchasePricePerMeter) || 0,
                        withdrawnAmount: parseFloat(item.withdrawnAmount) || 0,
                        purchaseDate: item.purchaseDate || new Date().toISOString().slice(0, 10),
                        notes: item.notes || ""
                    }));
                    db.devPartners.push(...newPartners);
                    saveDB();
                    sendJSON(res, 200, { success: true });
                }
            } catch (e) {
                sendJSON(res, 400, { error: "خطأ في مدخلات الشركاء" });
            }
            return;
        }
    }

    // ---------------------------------------------------------
    // MARKETING AGENTS APIs (Developer manages agents)
    // ---------------------------------------------------------
    if (pathname === '/api/developer/agents' && req.method === 'GET') {
        if (!currentUser || currentUser.role !== 'developer') return sendJSON(res, 403, { error: "غير مصرح" });
        const list = db.users.filter(u => u.role === 'agent' && u.developerId === currentUser.id);
        sendJSON(res, 200, list);
        return;
    }

    if (pathname === '/api/developer/agents' && req.method === 'POST') {
        if (!currentUser || currentUser.role !== 'developer') return sendJSON(res, 403, { error: "غير مصرح" });
        const body = await parseRequestBody(req);
        try {
            const { username, password, subdivisionId, agentType, companyName, phone } = JSON.parse(body);
            if (!username || !password || !subdivisionId) {
                return sendJSON(res, 400, { error: "اسم المستخدم، كلمة المرور والمخطط مطلوبة" });
            }
            if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
                return sendJSON(res, 400, { error: "اسم المستخدم هذا مستخدم بالفعل للوكيل" });
            }

            const newAgent = {
                id: "agent_" + Date.now(),
                username: username.trim(),
                password: password.trim(),
                role: "agent",
                agentType: agentType || "marketing", // 'marketing' or 'approved'
                developerId: currentUser.id,
                subdivisionId: subdivisionId,
                companyName: companyName ? companyName.trim() : "",
                phone: phone ? phone.trim() : "",
                subscriptionType: "agent"
            };

            db.users.push(newAgent);
            saveDB();
            sendJSON(res, 201, newAgent);
        } catch (e) {
            sendJSON(res, 400, { error: "مدخلات خاطئة لإنشاء الوكيل" });
        }
        return;
    }

    const deleteAgentMatch = pathname.match(/^\/api\/developer\/agents\/([^\/]+)$/);
    if (deleteAgentMatch && req.method === 'DELETE') {
        const agentId = deleteAgentMatch[1];
        if (!currentUser || currentUser.role !== 'developer') return sendJSON(res, 403, { error: "غير مصرح" });
        db.users = db.users.filter(u => u.id !== agentId);
        saveDB();
        sendJSON(res, 200, { success: true });
        return;
    }

    // ---------------------------------------------------------
    // MESSAGES / CHAT APIs
    // ---------------------------------------------------------
    if (pathname === '/api/chat/messages' && req.method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح" });
        const list = db.messages.filter(m => m.fromUserId === currentUser.id || m.toUserId === currentUser.id);
        sendJSON(res, 200, list);
        return;
    }

    if (pathname === '/api/chat/messages' && req.method === 'POST') {
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح" });
        const body = await parseRequestBody(req);
        try {
            const { toUserId, subdivisionId, message } = JSON.parse(body);
            if (!toUserId || !message) return sendJSON(res, 400, { error: "المستلم والرسالة مطلوبان" });
            const newMsg = {
                id: "msg_" + Date.now(),
                fromUserId: currentUser.id,
                toUserId: toUserId,
                subdivisionId: subdivisionId || "",
                message: message.trim(),
                timestamp: new Date().toISOString()
            };
            db.messages.push(newMsg);
            saveDB();
            sendJSON(res, 201, newMsg);
        } catch (e) {
            sendJSON(res, 400, { error: "مدخلات رسالة الدردشة خاطئة" });
        }
        return;
    }

    // ---------------------------------------------------------
    // BROKERS SEARCH & PROFILE FOLLOW APIs
    // ---------------------------------------------------------
    if (pathname === '/api/brokers/search' && req.method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح" });
        const q = (parsedUrl.query.q || '').toLowerCase();
        
        const developers = db.users.filter(u => u.role === 'developer' && (
            u.username.toLowerCase().includes(q) || 
            (u.companyName && u.companyName.toLowerCase().includes(q))
        ));

        const subdivisions = db.subdivisions.filter(s => 
            s.name.toLowerCase().includes(q) || 
            (s.address && s.address.toLowerCase().includes(q))
        );

        const subdivisionsWithDev = subdivisions.map(s => {
            const dev = db.users.find(u => u.id === s.developerId);
            return {
                ...s,
                developerCompanyName: dev ? dev.companyName : ""
            };
        });

        sendJSON(res, 200, { developers, subdivisions: subdivisionsWithDev });
        return;
    }

    if (pathname === '/api/brokers/follow' && req.method === 'POST') {
        if (!currentUser || currentUser.role !== 'broker') return sendJSON(res, 403, { error: "المكاتب فقط يمكنها المتابعة" });
        const body = await parseRequestBody(req);
        try {
            const { type, targetId } = JSON.parse(body);
            if (!type || !targetId) return sendJSON(res, 400, { error: "نوع الهدف والهدف مطلوبان" });
            
            const existingFollowIdx = db.follows.findIndex(f => f.brokerId === currentUser.id && f.type === type && f.targetId === targetId);
            if (existingFollowIdx !== -1) {
                db.follows.splice(existingFollowIdx, 1);
                saveDB();
                sendJSON(res, 200, { success: true, status: 'unfollowed' });
            } else {
                db.follows.push({
                    brokerId: currentUser.id,
                    type: type,
                    targetId: targetId
                });
                saveDB();
                sendJSON(res, 200, { success: true, status: 'followed' });
            }
        } catch (e) {
            sendJSON(res, 400, { error: "خطأ في معالجة طلب المتابعة" });
        }
        return;
    }

    if (pathname === '/api/brokers/following' && req.method === 'GET') {
        if (!currentUser) return sendJSON(res, 401, { error: "غير مصرح" });
        const myFollows = db.follows.filter(f => f.brokerId === currentUser.id);
        sendJSON(res, 200, myFollows);
        return;
    }

    // ---------------------------------------------------------
    // FILE ROUTING & FRONTEND STATIC FILES
    // ---------------------------------------------------------
    let filePath = INDEX_FILE;
    if (req.url === '/iphone' || req.url === '/iphone.html') {
        filePath = IPHONE_FILE;
    }
    
    writeLog(`[Server] Request received for: ${req.url} -> Serving file: ${filePath}`);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            writeLog(`[Server] Error reading file ${filePath}: ${err.message}`);
            res.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end('خطأ داخلي في خادم المنظومة');
        } else {
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    writeLog(`Server running at http://localhost:${PORT}`);
});
