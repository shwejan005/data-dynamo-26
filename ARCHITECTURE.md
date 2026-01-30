flowchart TB
    subgraph INPUTS["📥 INPUTS"]
        docs["Product Documents<br/>PDFs, Text"]
        brand["Brand Guidelines<br/>Logo, Colors"]
        media["Product Assets<br/>Images"]
    end

    subgraph FRONTEND["🌐 NEXT.JS FRONTEND"]
        direction LR
        dashboard["Dashboard"]
        studio["AI Video Studio"]
        social["Social Manager"]
        portfolio["Portfolio"]
        stats["Statistics"]
    end

    subgraph BACKEND["⚙️ CONVEX BACKEND"]
        db[("Campaigns<br/>Database")]
        auth["Clerk Auth"]
        queries["Realtime<br/>Queries"]
        mutations["Mutations"]
    end

    subgraph AI_AGENTS["🤖 AI AGENTS"]
        direction TB
        gemini["🧠 GEMINI AI<br/>━━━━━━━━━━<br/>• Content Analysis<br/>• Script Generation<br/>• Caption Writing"]
        stability["🎨 STABILITY AI<br/>━━━━━━━━━━<br/>• Image Generation<br/>• Ad Creatives<br/>• Thumbnails"]
        fal["🎬 FAL AI<br/>━━━━━━━━━━<br/>• Video Generation<br/>• Animation<br/>• Motion Graphics"]
    end

    subgraph WORKFLOW["📋 7-STEP WORKFLOW"]
        direction LR
        w1["1. Upload"] --> w2["2. Style"] --> w3["3. Brand"] --> w4["4. Characters"] --> w5["5. Script"] --> w6["6. Generate"] --> w7["7. Publish"]
    end

    subgraph AUTOMATION["🔄 AUTOMATION"]
        n8n["n8n Workflows"]
        scheduler["Post Scheduler"]
        compress["Image Compression"]
    end

    subgraph OUTPUTS["📤 PUBLISHING"]
        bluesky["🦋 Bluesky"]
        download["⬇️ Download"]
        drafts["💾 Drafts"]
    end

    %% Connections
    INPUTS --> FRONTEND
    FRONTEND <--> BACKEND
    FRONTEND --> AI_AGENTS
    AI_AGENTS --> BACKEND
    WORKFLOW --> AI_AGENTS
    BACKEND --> AUTOMATION
    AUTOMATION --> OUTPUTS

    %% Styling
    classDef inputStyle fill:#1a1a2e,stroke:#f97316,color:#fff
    classDef frontendStyle fill:#16213e,stroke:#0ea5e9,color:#fff
    classDef backendStyle fill:#1a1a2e,stroke:#22c55e,color:#fff
    classDef aiStyle fill:#0f0f23,stroke:#a855f7,color:#fff
    classDef outputStyle fill:#1a1a2e,stroke:#f97316,color:#fff

    class INPUTS inputStyle
    class FRONTEND frontendStyle
    class BACKEND backendStyle
    class AI_AGENTS aiStyle
    class OUTPUTS outputStyle
```

---

## Flow Summary

```
User Input → AI Video Studio → AI Agents Process → Save to Database → Publish/Download
     │              │                  │                    │              │
     │              │                  │                    │              │
   Docs         7-Step          Gemini (Script)         Convex        Bluesky
   Brand        Workflow        Stability (Image)       Realtime      Download
   Assets       Chat UI         FAL (Video)             Storage       Drafts
```
