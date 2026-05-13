const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Sei un assistente esperto nell'analisi di computi metrici e preventivi edilizi italiani.
Estrai tutte le voci di lavoro dal documento PDF e restituisci un JSON con questo schema esatto:
{
  "rows": [
    { "description": "...", "quantity": 0, "unit": "...", "unit_price": 0 }
  ]
}
- description: descrizione della voce di lavoro (stringa, obbligatoria)
- quantity: quantità numerica (numero, 0 se non presente)
- unit: unità di misura come "m²", "ml", "cad", "ore" ecc. (stringa, vuota se non presente)
- unit_price: prezzo unitario in euro (numero, 0 se non presente)
Non includere righe di intestazione, subtotali o totali — solo le voci di lavoro.
Rispondi SOLO con il JSON, nessun altro testo.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pdfBase64 } = await req.json();
    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: "pdfBase64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-opus-4-7",
        max_tokens: 4096,
        system: SYSTEM,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
              },
              {
                type: "text",
                text: "Estrai tutte le voci di lavoro da questo computo metrico.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${response.status} ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const text = result.content?.find((b: { type: string }) => b.type === "text")?.text ?? "{}";

    const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(json);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
