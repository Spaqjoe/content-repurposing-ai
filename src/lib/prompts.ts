import { ContentFormat, CtaStyle, Tone } from "./types";

type PromptMessage = {
  role: "system" | "user";
  content: string;
};

const TONE_DIRECTIVES: Record<Tone, string> = {
  professional:
    "Write in a clear, credible, professional tone suitable for business creators.",
  casual:
    "Write in a warm, conversational tone that feels natural on social media.",
  bold: "Write with bold, confident language and strong hooks.",
  educational:
    "Write in an educational tone that teaches clearly without sounding dry.",
  hype: "Write with high energy, momentum, and creator-style excitement.",
};

const CTA_DIRECTIVES: Record<CtaStyle, string> = {
  soft: "Use a soft, low-pressure call to action.",
  direct: "Use a direct, action-oriented call to action.",
  none: "Do not include a call to action unless it is essential.",
};

function baseSystemPrompt(tone: Tone, ctaStyle: CtaStyle): string {
  return [
    "You are Content AI, a creator-focused repurposing assistant.",
    TONE_DIRECTIVES[tone],
    CTA_DIRECTIVES[ctaStyle],
    "Repurpose the provided source content directly. Use its ideas, facts, and wording.",
    "Do not give generic advice about repurposing or content creation.",
    "Return ONLY valid JSON with no markdown fences or commentary.",
    "Use \\n for line breaks inside JSON string values. Never use literal newlines inside JSON strings.",
  ].join(" ");
}

export function buildPromptMessages(
  format: ContentFormat,
  sourceContent: string,
  tone: Tone,
  ctaStyle: CtaStyle = "soft",
): PromptMessage[] {
  const system = baseSystemPrompt(tone, ctaStyle);

  switch (format) {
    case "carousel":
      return [
        { role: "system", content: system },
        {
          role: "user",
          content: `Repurpose this source into an Instagram carousel outline.

Requirements:
- 5 to 8 slides
- Slide 1 must be a strong hook
- Logical progression across slides
- Final slide must include a CTA
- Keep each slide concise and scannable

Return JSON in this exact shape:
{"slides":["Slide 1 text","Slide 2 text"]}

Source content:
${sourceContent}`,
        },
      ];

    case "hooks":
      return [
        { role: "system", content: system },
        {
          role: "user",
          content: `Generate short Reel hooks from this source.

Requirements:
- 5 to 10 hooks
- Varied angles: curiosity, pain point, benefit, contrarian
- Short, punchy phrasing
- One sentence each

Return JSON in this exact shape:
{"items":["Hook 1","Hook 2"]}

Source content:
${sourceContent}`,
        },
      ];

    case "caption":
      return [
        { role: "system", content: system },
        {
          role: "user",
          content: `Write social post captions from this source.

Requirements:
- 2 to 3 caption variants
- Each variant needs a strong opening line, body, and CTA when appropriate
- Include optional hashtags per variant
- Creator-friendly formatting

Return JSON in this exact shape:
{"variants":[{"text":"Caption text","hashtags":["#tag1","#tag2"]}]}

Source content:
${sourceContent}`,
        },
      ];

    case "linkedin":
      return [
        { role: "system", content: system },
        {
          role: "user",
          content: `Write one LinkedIn post from this source.

Requirements:
- Strong opening line
- Short paragraphs with line breaks
- Insightful and creator-friendly
- End with a thoughtful CTA if appropriate

Return JSON in this exact shape:
{"post":"Opening line\\n\\nSecond paragraph\\n\\nClosing CTA"}

Source content:
${sourceContent}`,
        },
      ];

    case "thread":
      return [
        { role: "system", content: system },
        {
          role: "user",
          content: `Write an X thread from this source.

Requirements:
- 4 to 8 tweets
- First tweet must hook attention
- Each tweet should stand alone but flow together
- Keep tweets concise

Return JSON in this exact shape:
{"tweets":["Tweet 1","Tweet 2"]}

Source content:
${sourceContent}`,
        },
      ];
  }
}
