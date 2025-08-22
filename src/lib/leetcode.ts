type LeetMeta = {
  title: string | null;
  difficulty: string | null;
  tags: string[];
};

function extractSlugFromUrl(problemUrl: string): string | null {
  try {
    const u = new URL(problemUrl);
    // Expect /problems/<slug>/
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "problems");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return null;
  } catch {
    return null;
  }
}

export async function fetchLeetCodeMeta(problemUrl: string): Promise<LeetMeta> {
  const slug = extractSlugFromUrl(problemUrl);
  if (!slug) return { title: null, difficulty: null, tags: [] };

  const endpoint = "https://leetcode.com/graphql";
  const body = {
    operationName: "questionData",
    variables: { titleSlug: slug },
    query:
      "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionTitle difficulty topicTags { name slug } } }",
  };
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": "leet-tracker/0.1 (+github.com)",
      },
      body: JSON.stringify(body),
      // Avoid caching to reflect recent changes
      cache: "no-store",
    });
    if (!res.ok) return { title: null, difficulty: null, tags: [] };
    const json: unknown = await res.json();
    type GqlTag = { name?: string | null };
    type GqlQuestion = {
      questionTitle?: string | null;
      difficulty?: string | null;
      topicTags?: GqlTag[] | null;
    };
    const q = (json as { data?: { question?: GqlQuestion } })?.data?.question;
    if (!q) return { title: null, difficulty: null, tags: [] };
    const tags: string[] = Array.isArray(q.topicTags)
      ? (q.topicTags as GqlTag[])
          .map((t) => (t?.name ?? "").toString())
          .filter((n): n is string => Boolean(n))
      : [];
    return {
      title: q.questionTitle ?? null,
      difficulty: q.difficulty ?? null,
      tags,
    };
  } catch {
    return { title: null, difficulty: null, tags: [] };
  }
}
