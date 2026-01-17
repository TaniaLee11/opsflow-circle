import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlideContent {
  title: string;
  content: string[];
  type: 'title' | 'content' | 'bullets' | 'cta';
}

interface PresentationRequest {
  topic: string;
  context?: string;
  slideCount?: number;
}

// VOPS Brand Colors
const VOPS_COLORS = {
  primary: '#9b87f5',      // Purple
  primaryDark: '#7E69AB',  // Dark purple
  accent: '#F97316',       // Orange
  dark: '#1A1F2C',         // Dark background
  light: '#F1F0FB',        // Light background
  text: '#403E43',         // Text color
  white: '#FFFFFF',
};

// Validate that content is actually a PDF (check magic bytes)
function isValidPDF(data: Uint8Array): boolean {
  // PDF files start with "%PDF-"
  if (data.length < 5) return false;
  const header = new TextDecoder().decode(data.slice(0, 5));
  return header === '%PDF-';
}

// Check if content looks like HTML (error page)
function looksLikeHTML(data: Uint8Array): boolean {
  try {
    const text = new TextDecoder().decode(data.slice(0, 100)).toLowerCase();
    return text.includes('<!doctype') || text.includes('<html') || text.includes('not found');
  } catch {
    return false;
  }
}

// Generate PowerPoint-compatible XML (PPTX structure)
function generatePPTXML(slides: SlideContent[], title: string): string {
  // Generate Office Open XML for PowerPoint
  const slideXMLs = slides.map((slide, index) => {
    const isTitle = slide.type === 'title';
    const contentItems = slide.content.map((item, i) => 
      `<a:p><a:r><a:t>${escapeXML(item)}</a:t></a:r></a:p>`
    ).join('\n');
    
    return `
      <slide${index + 1}>
        <title>${escapeXML(slide.title)}</title>
        <type>${slide.type}</type>
        <content>${contentItems}</content>
      </slide${index + 1}>
    `;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<presentation>
  <title>${escapeXML(title)}</title>
  <created>${new Date().toISOString()}</created>
  <slideCount>${slides.length}</slideCount>
  <slides>
    ${slideXMLs}
  </slides>
</presentation>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate clean, downloadable HTML presentation
function generateDownloadableHTML(slides: SlideContent[], title: string): string {
  const slidesHTML = slides.map((slide, i) => {
    const isTitle = slide.type === 'title';
    const isCTA = slide.type === 'cta';
    
    let contentHTML = '';
    
    if (slide.type === 'bullets') {
      contentHTML = `
        <ul class="bullet-list">
          ${slide.content.map(item => `
            <li><span class="bullet">●</span><span>${item}</span></li>
          `).join('')}
        </ul>
      `;
    } else if (slide.type === 'cta') {
      contentHTML = `
        <div class="cta-content">
          ${slide.content.map(item => `<p>${item}</p>`).join('')}
          <div class="cta-button">Get Started Today</div>
        </div>
      `;
    } else {
      contentHTML = slide.content.map(item => `<p class="content-text">${item}</p>`).join('');
    }

    return `
      <div class="slide ${isTitle ? 'slide-title' : ''} ${isCTA ? 'slide-cta' : ''}">
        <div class="slide-header">
          <div class="logo-container">
            <div class="logo-icon"></div>
            <span class="logo-text">Virtual OPS Assist</span>
          </div>
          <span class="slide-number">${i + 1} / ${slides.length}</span>
        </div>
        
        <div class="slide-content">
          <h2 class="slide-title-text">${slide.title}</h2>
          ${contentHTML}
        </div>
        
        <div class="slide-footer">
          <span>© ${new Date().getFullYear()} Virtual OPS Assist. All rights reserved.</span>
          <span>virtualopsassist.com</span>
        </div>
      </div>
    `;
  }).join('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Virtual OPS Assist Presentation</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    @page { 
      size: 1280px 720px landscape; 
      margin: 0; 
    }
    
    @media print { 
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } 
      .slide { page-break-after: always; page-break-inside: avoid; }
      .slide:last-child { page-break-after: auto; }
      .controls { display: none !important; }
    }
    
    body { 
      margin: 0; 
      padding: 0; 
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #333;
    }
    
    .controls {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: rgba(0,0,0,0.8);
      padding: 10px 20px;
      border-radius: 8px;
      color: white;
      font-size: 14px;
    }
    
    .controls button {
      background: ${VOPS_COLORS.primary};
      color: white;
      border: none;
      padding: 8px 16px;
      margin: 0 5px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .controls button:hover {
      background: ${VOPS_COLORS.primaryDark};
    }
    
    .slide { 
      width: 1280px; 
      height: 720px; 
      position: relative; 
      overflow: hidden;
      margin: 20px auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      background: ${VOPS_COLORS.light};
      padding: 60px 80px;
    }
    
    .slide-title {
      background: linear-gradient(135deg, ${VOPS_COLORS.dark} 0%, #2D2B55 100%);
    }
    
    .slide-title .slide-title-text,
    .slide-title .content-text {
      color: ${VOPS_COLORS.white};
      text-align: center;
    }
    
    .slide-title .logo-text,
    .slide-title .slide-number {
      color: rgba(255,255,255,0.6);
    }
    
    .slide-title .slide-footer span {
      color: rgba(255,255,255,0.4);
    }
    
    .slide-header {
      position: absolute;
      top: 30px;
      left: 80px;
      right: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, ${VOPS_COLORS.primary}, ${VOPS_COLORS.accent});
      border-radius: 8px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: ${VOPS_COLORS.primary};
    }
    
    .slide-number {
      font-size: 14px;
      color: ${VOPS_COLORS.text};
    }
    
    .slide-content {
      margin-top: 100px;
    }
    
    .slide-title .slide-content {
      margin-top: 140px;
    }
    
    .slide-title-text {
      font-size: 36px;
      font-weight: 700;
      color: ${VOPS_COLORS.dark};
      margin-bottom: 40px;
    }
    
    .slide-title .slide-title-text {
      font-size: 48px;
      margin-bottom: 30px;
    }
    
    .content-text {
      font-size: 22px;
      color: ${VOPS_COLORS.text};
      margin-bottom: 16px;
      line-height: 1.6;
    }
    
    .bullet-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .bullet-list li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 24px;
      font-size: 22px;
      color: ${VOPS_COLORS.text};
    }
    
    .bullet-list .bullet {
      color: ${VOPS_COLORS.primary};
      margin-right: 16px;
      font-size: 28px;
    }
    
    .cta-content {
      text-align: center;
    }
    
    .cta-content p {
      font-size: 24px;
      color: ${VOPS_COLORS.text};
      margin-bottom: 20px;
    }
    
    .cta-button {
      display: inline-block;
      margin-top: 40px;
      padding: 16px 48px;
      background: linear-gradient(135deg, ${VOPS_COLORS.primary}, ${VOPS_COLORS.accent});
      color: white;
      font-size: 20px;
      font-weight: 600;
      border-radius: 8px;
    }
    
    .slide-footer {
      position: absolute;
      bottom: 30px;
      left: 80px;
      right: 80px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #8E9196;
    }
  </style>
</head>
<body>
  <div class="controls">
    <span>Presentation: ${title}</span>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  ${slidesHTML}
  <script>
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      const slides = document.querySelectorAll('.slide');
      let current = 0;
      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight) current = i;
      });
      
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (current < slides.length - 1) slides[current + 1].scrollIntoView({ behavior: 'smooth' });
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (current > 0) slides[current - 1].scrollIntoView({ behavior: 'smooth' });
      }
    });
  </script>
</body>
</html>`;
}

// Generate JSON export of presentation data
function generateJSONExport(slides: SlideContent[], title: string, topic: string, context?: string): string {
  return JSON.stringify({
    title,
    topic,
    context,
    created: new Date().toISOString(),
    slideCount: slides.length,
    slides: slides.map((slide, index) => ({
      slideNumber: index + 1,
      title: slide.title,
      type: slide.type,
      content: slide.content,
    })),
    metadata: {
      generator: 'Virtual OPS Assist',
      version: '1.0',
      format: 'presentation-json',
    }
  }, null, 2);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { topic, context, slideCount = 8 }: PresentationRequest = await req.json();

    if (!topic) {
      return new Response(
        JSON.stringify({ success: false, error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating presentation for user ${user.id}: "${topic}"`);

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, display_name")
      .eq("user_id", user.id)
      .single();

    const orgId = profile?.organization_id;

    // Use AI to generate slide content
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const systemPrompt = `You are a professional presentation designer for Virtual OPS Assist, a business operations company. 
Create compelling, professional slide content that showcases expertise in:
- Finance & Accounting
- Operations Management
- Marketing Strategy
- Business Compliance
- Tax Planning

Generate exactly ${slideCount} slides in JSON format. Each slide should have:
- title: Clear, impactful headline
- content: Array of 2-4 bullet points or paragraphs
- type: One of 'title', 'content', 'bullets', 'cta'

The first slide should be type 'title' (cover slide).
The last slide should be type 'cta' (call to action).
Most middle slides should be type 'bullets'.

Keep content concise, professional, and actionable.`;

    const userPrompt = `Create a presentation about: ${topic}${context ? `\n\nAdditional context: ${context}` : ''}

Return ONLY valid JSON array of slides, no markdown or explanation.`;

    let slides: SlideContent[] = [];

    if (lovableApiKey) {
      try {
        const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          
          // Parse JSON from response (handle potential markdown code blocks)
          let jsonStr = content.trim();
          if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.slice(7);
          }
          if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.slice(3);
          }
          if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.slice(0, -3);
          }
          
          try {
            slides = JSON.parse(jsonStr.trim());
            console.log(`AI generated ${slides.length} slides successfully`);
          } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
          }
        }
      } catch (aiError) {
        console.error("AI generation error:", aiError);
      }
    }

    // Fallback slides if AI fails
    if (!slides || slides.length === 0) {
      console.log("Using fallback slides");
      slides = [
        {
          title: topic,
          content: ["Professional Presentation", "Created by Virtual OPS Assist"],
          type: 'title'
        },
        {
          title: "Overview",
          content: [
            "Key insights and analysis",
            "Strategic recommendations",
            "Action items for success"
          ],
          type: 'bullets'
        },
        {
          title: "Key Points",
          content: [
            "Data-driven approach to business operations",
            "Streamlined processes for maximum efficiency",
            "Expert guidance every step of the way"
          ],
          type: 'bullets'
        },
        {
          title: "Next Steps",
          content: [
            "Schedule a consultation",
            "www.virtualopsassist.com"
          ],
          type: 'cta'
        }
      ];
    }

    // Generate downloadable HTML presentation (most reliable format)
    const presentationHTML = generateDownloadableHTML(slides, topic);
    
    // Use HTML as the primary format - it's reliable and can be printed to PDF
    const fileContent = new TextEncoder().encode(presentationHTML);
    const mimeType = 'text/html';
    const fileExtension = 'html';
    
    console.log(`Generated HTML presentation, size: ${fileContent.length} bytes`);
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeTopic = topic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const fileName = `${safeTopic}_${timestamp}.${fileExtension}`;
    const storagePath = `${user.id}/presentations/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('vault')
      .upload(storagePath, fileContent, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to save presentation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Uploaded presentation to: ${storagePath}`);

    // Also save JSON version for data export
    const jsonContent = generateJSONExport(slides, topic, topic, context);
    const jsonFileName = `${safeTopic}_${timestamp}.json`;
    const jsonStoragePath = `${user.id}/presentations/${jsonFileName}`;
    
    await supabase.storage
      .from('vault')
      .upload(jsonStoragePath, new TextEncoder().encode(jsonContent), {
        contentType: 'application/json',
        upsert: true,
      });

    // Create vault document record
    const { data: document, error: docError } = await supabase
      .from('vault_documents')
      .insert({
        user_id: user.id,
        organization_id: orgId,
        name: `${topic} Presentation`,
        type: 'presentation',
        mime_type: mimeType,
        size_bytes: fileContent.length,
        storage_path: storagePath,
        category: 'presentations',
        description: `AI-generated presentation: ${topic}. Open in browser and use Print to save as PDF.`,
        metadata: {
          slides: slides.length,
          generated_at: new Date().toISOString(),
          topic,
          context,
          format: fileExtension,
          jsonExportPath: jsonStoragePath,
        },
      })
      .select()
      .single();

    if (docError) {
      console.error("Document record error:", docError);
    }

    // Get download URL
    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
    const { data: urlData } = await supabase.storage
      .from('vault')
      .createSignedUrl(storagePath, 3600, { 
        download: `${sanitizedTopic} Presentation.${fileExtension}` 
      });

    console.log(`Presentation generated successfully: ${fileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `I've created your "${topic}" presentation with ${slides.length} slides! 📊\n\nThe file is saved to your Vault as an interactive HTML presentation. Open it in your browser and click "Print / Save as PDF" to export as PDF.`,
        document: {
          id: document?.id,
          name: `${topic} Presentation`,
          path: storagePath,
          slides: slides.length,
          format: fileExtension,
          downloadUrl: urlData?.signedUrl,
        },
        slides: slides.map(s => s.title),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Presentation generation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Failed to generate presentation" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
