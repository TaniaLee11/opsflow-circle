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

// Generate HTML for a presentation slide
function generateSlideHTML(slide: SlideContent, index: number, total: number): string {
  const isTitle = slide.type === 'title';
  const isCTA = slide.type === 'cta';
  
  let contentHTML = '';
  
  if (slide.type === 'bullets') {
    contentHTML = `
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${slide.content.map(item => `
          <li style="display: flex; align-items: flex-start; margin-bottom: 24px; font-size: 22px; color: ${VOPS_COLORS.text};">
            <span style="color: ${VOPS_COLORS.primary}; margin-right: 16px; font-size: 28px;">•</span>
            ${item}
          </li>
        `).join('')}
      </ul>
    `;
  } else if (slide.type === 'cta') {
    contentHTML = `
      <div style="text-align: center;">
        ${slide.content.map(item => `<p style="font-size: 24px; color: ${VOPS_COLORS.text}; margin-bottom: 20px;">${item}</p>`).join('')}
        <div style="margin-top: 40px;">
          <span style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, ${VOPS_COLORS.primary}, ${VOPS_COLORS.accent}); color: white; font-size: 20px; font-weight: 600; border-radius: 8px;">
            Get Started Today
          </span>
        </div>
      </div>
    `;
  } else {
    contentHTML = slide.content.map(item => `<p style="font-size: 22px; color: ${VOPS_COLORS.text}; margin-bottom: 16px; line-height: 1.6;">${item}</p>`).join('');
  }

  return `
    <div style="page-break-after: always; width: 1280px; height: 720px; padding: 60px 80px; box-sizing: border-box; background: ${isTitle ? `linear-gradient(135deg, ${VOPS_COLORS.dark} 0%, #2D2B55 100%)` : VOPS_COLORS.light}; font-family: 'Segoe UI', system-ui, sans-serif; position: relative;">
      <!-- Header -->
      <div style="position: absolute; top: 30px; left: 80px; right: 80px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${VOPS_COLORS.primary}, ${VOPS_COLORS.accent}); border-radius: 8px;"></div>
          <span style="font-size: 18px; font-weight: 600; color: ${isTitle ? VOPS_COLORS.white : VOPS_COLORS.primary};">Virtual OPS Assist</span>
        </div>
        <span style="font-size: 14px; color: ${isTitle ? 'rgba(255,255,255,0.6)' : VOPS_COLORS.text};">${index + 1} / ${total}</span>
      </div>
      
      <!-- Content -->
      <div style="margin-top: ${isTitle ? '140px' : '100px'};">
        <h2 style="font-size: ${isTitle ? '48px' : '36px'}; font-weight: 700; color: ${isTitle ? VOPS_COLORS.white : VOPS_COLORS.dark}; margin-bottom: ${isTitle ? '30px' : '40px'}; ${isTitle ? 'text-align: center;' : ''}">${slide.title}</h2>
        ${contentHTML}
      </div>
      
      <!-- Footer -->
      <div style="position: absolute; bottom: 30px; left: 80px; right: 80px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: ${isTitle ? 'rgba(255,255,255,0.4)' : '#8E9196'};">© ${new Date().getFullYear()} Virtual OPS Assist. All rights reserved.</span>
        <span style="font-size: 12px; color: ${isTitle ? 'rgba(255,255,255,0.4)' : '#8E9196'};">virtualopsassist.com</span>
      </div>
    </div>
  `;
}

// Generate full HTML document for PDF conversion
function generatePresentationHTML(slides: SlideContent[], title: string): string {
  const slidesHTML = slides.map((slide, i) => generateSlideHTML(slide, i, slides.length)).join('\n');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    @page {
      size: 1280px 720px;
      margin: 0;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      margin: 0;
      padding: 0;
      background: #f5f5f5;
    }
    .slide {
      page-break-after: always;
      page-break-inside: avoid;
      width: 1280px;
      height: 720px;
      position: relative;
      overflow: hidden;
    }
    .slide:last-child {
      page-break-after: auto;
    }
  </style>
</head>
<body>
${slidesHTML}
</body>
</html>
  `;
}

// Convert HTML to PDF using external service
async function convertToPDF(html: string): Promise<Uint8Array | null> {
  try {
    // Use html2pdf.app API (free tier available)
    const response = await fetch('https://html2pdf.app/api/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: html,
        width: 1280,
        height: 720,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        landscape: true,
        printBackground: true,
      }),
    });

    if (!response.ok) {
      console.error('PDF conversion API error:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('PDF conversion error:', error);
    return null;
  }
}

// Alternative: Generate PDF-ready HTML with embedded styles for browser print
function generatePrintableHTML(slides: SlideContent[], title: string): string {
  const slidesHTML = slides.map((slide, i) => {
    const isTitle = slide.type === 'title';
    const isCTA = slide.type === 'cta';
    
    let contentHTML = '';
    
    if (slide.type === 'bullets') {
      contentHTML = `
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${slide.content.map(item => `
            <li style="display: flex; align-items: flex-start; margin-bottom: 24px; font-size: 22px; color: ${VOPS_COLORS.text};">
              <span style="color: ${VOPS_COLORS.primary}; margin-right: 16px; font-size: 28px;">●</span>
              <span>${item}</span>
            </li>
          `).join('')}
        </ul>
      `;
    } else if (slide.type === 'cta') {
      contentHTML = `
        <div style="text-align: center;">
          ${slide.content.map(item => `<p style="font-size: 24px; color: ${VOPS_COLORS.text}; margin-bottom: 20px;">${item}</p>`).join('')}
          <div style="margin-top: 40px;">
            <span style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, ${VOPS_COLORS.primary}, ${VOPS_COLORS.accent}); color: white; font-size: 20px; font-weight: 600; border-radius: 8px;">
              Get Started Today
            </span>
          </div>
        </div>
      `;
    } else {
      contentHTML = slide.content.map(item => `<p style="font-size: 22px; color: ${VOPS_COLORS.text}; margin-bottom: 16px; line-height: 1.6;">${item}</p>`).join('');
    }

    return `
      <div class="slide" style="padding: 60px 80px; background: ${isTitle ? `linear-gradient(135deg, ${VOPS_COLORS.dark} 0%, #2D2B55 100%)` : VOPS_COLORS.light}; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;">
        <div style="position: absolute; top: 30px; left: 80px; right: 80px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: linear-gradient(135deg, ${VOPS_COLORS.primary}, ${VOPS_COLORS.accent}); border-radius: 8px;"></div>
            <span style="font-size: 18px; font-weight: 600; color: ${isTitle ? VOPS_COLORS.white : VOPS_COLORS.primary};">Virtual OPS Assist</span>
          </div>
          <span style="font-size: 14px; color: ${isTitle ? 'rgba(255,255,255,0.6)' : VOPS_COLORS.text};">${i + 1} / ${slides.length}</span>
        </div>
        
        <div style="margin-top: ${isTitle ? '140px' : '100px'};">
          <h2 style="font-size: ${isTitle ? '48px' : '36px'}; font-weight: 700; color: ${isTitle ? VOPS_COLORS.white : VOPS_COLORS.dark}; margin: 0 0 ${isTitle ? '30px' : '40px'} 0; ${isTitle ? 'text-align: center;' : ''}">${slide.title}</h2>
          ${contentHTML}
        </div>
        
        <div style="position: absolute; bottom: 30px; left: 80px; right: 80px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: ${isTitle ? 'rgba(255,255,255,0.4)' : '#8E9196'};">© ${new Date().getFullYear()} Virtual OPS Assist. All rights reserved.</span>
          <span style="font-size: 12px; color: ${isTitle ? 'rgba(255,255,255,0.4)' : '#8E9196'};">virtualopsassist.com</span>
        </div>
      </div>
    `;
  }).join('\n');
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: 1280px 720px landscape; margin: 0; }
    @media print { body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }
    body { margin: 0; padding: 0; }
    .slide { width: 1280px; height: 720px; position: relative; overflow: hidden; page-break-after: always; page-break-inside: avoid; }
    .slide:last-child { page-break-after: auto; }
  </style>
</head>
<body>${slidesHTML}</body>
</html>`;
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

    // Generate HTML presentation
    const presentationHTML = generatePrintableHTML(slides, topic);
    
    // Try to convert to PDF
    let fileContent: Uint8Array;
    let mimeType: string;
    let fileExtension: string;
    
    console.log("Attempting PDF conversion...");
    const pdfContent = await convertToPDF(presentationHTML);
    
    if (pdfContent && pdfContent.length > 1000) {
      console.log("PDF conversion successful, size:", pdfContent.length);
      fileContent = pdfContent;
      mimeType = 'application/pdf';
      fileExtension = 'pdf';
    } else {
      console.log("PDF conversion failed, falling back to HTML");
      fileContent = new TextEncoder().encode(presentationHTML);
      mimeType = 'text/html';
      fileExtension = 'html';
    }
    
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
        description: `AI-generated ${fileExtension.toUpperCase()} presentation: ${topic}`,
        metadata: {
          slides: slides.length,
          generated_at: new Date().toISOString(),
          topic,
          context,
          format: fileExtension,
        },
      })
      .select()
      .single();

    if (docError) {
      console.error("Document record error:", docError);
    }

    // Get download URL with download flag to trigger browser download
    const sanitizedTopic = topic.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
    const { data: urlData } = await supabase.storage
      .from('vault')
      .createSignedUrl(storagePath, 3600, { 
        download: `${sanitizedTopic} Presentation.${fileExtension}` 
      }); // 1 hour expiry with forced download

    console.log(`Presentation generated successfully: ${fileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `I've created your "${topic}" presentation with ${slides.length} slides as ${fileExtension.toUpperCase()} and saved it to your Vault! 📊`,
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
