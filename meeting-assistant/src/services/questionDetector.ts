const QUESTION_STARTERS =
  /^(what|how|why|when|where|who|which|whose|whom|can you|could you|would you|will you|do you|did you|have you|are you|is there|tell me|describe|explain|walk me through|give me an example)/i;

const MIN_QUESTION_LENGTH = 12;

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map(normalize)
    .filter((part) => part.length > 0);
}

function looksLikeQuestion(sentence: string): boolean {
  const trimmed = normalize(sentence);
  if (trimmed.length < MIN_QUESTION_LENGTH) {
    return false;
  }

  if (trimmed.endsWith('?')) {
    return true;
  }

  return QUESTION_STARTERS.test(trimmed);
}

export function extractNewQuestions(
  fullTranscript: string,
  alreadySeen: Set<string>,
): string[] {
  const sentences = splitSentences(fullTranscript);
  const found: string[] = [];

  for (const sentence of sentences) {
    if (!looksLikeQuestion(sentence)) {
      continue;
    }

    const key = sentence.toLowerCase();
    if (alreadySeen.has(key)) {
      continue;
    }

    alreadySeen.add(key);
    found.push(sentence);
  }

  return found;
}

export function extractLatestQuestion(transcript: string): string | null {
  const sentences = splitSentences(transcript);
  for (let i = sentences.length - 1; i >= 0; i -= 1) {
    if (looksLikeQuestion(sentences[i])) {
      return sentences[i];
    }
  }
  return null;
}
