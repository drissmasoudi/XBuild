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
    const { pdfBase64, pdfText } = await req.json();
    if (!pdfBase64 && !pdfText) {
      return new Response(JSON.stringify({ error: "pdfBase64 or pdfText required" }), {
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

    let model: string;
    let max_tokens: number;
    let messages: unknown[];

    if (pdfText) {
      console.log("Percorso 1: testo estratto dal client");
      model = "claude-haiku-4-5";
      max_tokens = 2048;
      const truncated = pdfText.slice(0, 30000);
      messages = [
        {
          role: "user",
          content: `Analizza il seguente testo di un computo metrico ed estrai le voci di lavoro.\n\n${truncated}`,
        },
      ];
    } else {
      console.log("Percorso 2: PDF scansionato/immagine, uso Sonnet con vision");
      model = "claude-sonnet-4-5";
      max_tokens = 4096;
      messages = [
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
      ];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({ model, max_tokens, system: SYSTEM, messages }),
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
