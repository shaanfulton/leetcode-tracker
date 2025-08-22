import { pool, ensureInitialized } from "@/lib/db";
import { fetchLeetCodeMeta } from "@/lib/leetcode";

type CliOptions = {
  count: number;
  days: number;
  reset: boolean;
  provider: string;
  providerAccountId: string;
  deleteOnly: boolean;
};

function parseCliOptions(argv: string[]): CliOptions {
  const opts: CliOptions = {
    count: 50,
    days: 60,
    reset: false,
    provider: "mock",
    providerAccountId: "seed",
    deleteOnly: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--count" && argv[i + 1]) {
      opts.count = Math.max(1, Number(argv[++i]) || 50);
    } else if (arg === "--days" && argv[i + 1]) {
      opts.days = Math.max(1, Number(argv[++i]) || 60);
    } else if (arg === "--reset") {
      opts.reset = true;
    } else if (arg === "--delete") {
      opts.deleteOnly = true;
    } else if (arg === "--provider" && argv[i + 1]) {
      opts.provider = argv[++i];
    } else if (arg === "--provider-account-id" && argv[i + 1]) {
      opts.providerAccountId = argv[++i];
    }
  }
  return opts;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LEETCODE_150_TITLES: string[] = [
  // Array / String
  "Merge Sorted Array",
  "Remove Element",
  "Remove Duplicates from Sorted Array",
  "Remove Duplicates from Sorted Array II",
  "Majority Element",
  "Rotate Array",
  "Best Time to Buy and Sell Stock",
  "Best Time to Buy and Sell Stock II",
  "Jump Game",
  "Jump Game II",
  "H-Index",
  "Insert Delete GetRandom O(1)",
  "Product of Array Except Self",
  "Gas Station",
  "Candy",
  "Trapping Rain Water",
  "Roman to Integer",
  "Integer to Roman",
  "Length of Last Word",
  "Longest Common Prefix",
  "Reverse Words in a String",
  "Zigzag Conversion",
  "Find the Index of the First Occurrence in a String",
  "Text Justification",
  // Two Pointers
  "Valid Palindrome",
  "Is Subsequence",
  "Two Sum II - Input Array Is Sorted",
  "Container With Most Water",
  "3Sum",
  // Sliding Window
  "Minimum Size Subarray Sum",
  "Longest Substring Without Repeating Characters",
  "Substring with Concatenation of All Words",
  "Minimum Window Substring",
  // Matrix
  "Valid Sudoku",
  "Spiral Matrix",
  "Rotate Image",
  "Set Matrix Zeroes",
  "Game of Life",
  // Hashmap
  "Ransom Note",
  "Isomorphic Strings",
  "Word Pattern",
  "Valid Anagram",
  "Group Anagrams",
  "Two Sum",
  "Happy Number",
  "Contains Duplicate II",
  "Longest Consecutive Sequence",
  // Intervals
  "Summary Ranges",
  "Merge Intervals",
  "Insert Interval",
  "Minimum Number of Arrows to Burst Balloons",
  // Stack
  "Valid Parentheses",
  "Simplify Path",
  "Min Stack",
  "Evaluate Reverse Polish Notation",
  "Basic Calculator",
  // Linked List
  "Linked List Cycle",
  "Add Two Numbers",
  "Merge Two Sorted Lists",
  "Copy List with Random Pointer",
  "Reverse Linked List II",
  "Reverse Nodes in k-Group",
  "Remove Nth Node From End of List",
  "Remove Duplicates from Sorted List II",
  "Rotate List",
  "Partition List",
  "LRU Cache",
  // Binary Tree - General
  "Maximum Depth of Binary Tree",
  "Same Tree",
  "Invert Binary Tree",
  "Symmetric Tree",
  "Construct Binary Tree from Preorder and Inorder Traversal",
  "Construct Binary Tree from Inorder and Postorder Traversal",
  "Populating Next Right Pointers in Each Node II",
  "Flatten Binary Tree to Linked List",
  "Path Sum",
  "Sum Root to Leaf Numbers",
  "Binary Tree Maximum Path Sum",
  "Binary Search Tree Iterator",
  "Count Complete Tree Nodes",
  "Lowest Common Ancestor of a Binary Tree",
  // Binary Tree - BFS
  "Binary Tree Right Side View",
  "Average of Levels in Binary Tree",
  "Binary Tree Level Order Traversal",
  "Binary Tree Zigzag Level Order Traversal",
  // Binary Search Tree
  "Minimum Absolute Difference in BST",
  "Kth Smallest Element in a BST",
  "Validate Binary Search Tree",
  // Graph - General
  "Number of Islands",
  "Surrounded Regions",
  "Clone Graph",
  "Evaluate Division",
  "Course Schedule",
  "Course Schedule II",
  // Graph - BFS
  "Snakes and Ladders",
  "Minimum Genetic Mutation",
  "Word Ladder",
  // Trie
  "Implement Trie (Prefix Tree)",
  "Design Add and Search Words Data Structure",
  "Word Search II",
  // Backtracking
  "Letter Combinations of a Phone Number",
  "Combinations",
  "Permutations",
  "Combination Sum",
  "N-Queens II",
  "Generate Parentheses",
  "Word Search",
  // Divide & Conquer
  "Convert Sorted Array to Binary Search Tree",
  "Sort List",
  "Construct Quad Tree",
  "Merge k Sorted Lists",
  // Kadane's Algorithm
  "Maximum Subarray",
  "Maximum Sum Circular Subarray",
  // Binary Search
  "Search Insert Position",
  "Search a 2D Matrix",
  "Find Peak Element",
  "Search in Rotated Sorted Array",
  "Find First and Last Position of Element in Sorted Array",
  "Find Minimum in Rotated Sorted Array",
  "Median of Two Sorted Arrays",
  // Heap
  "Kth Largest Element in an Array",
  "IPO",
  "Find K Pairs with Smallest Sums",
  "Find Median from Data Stream",
  // Bit Manipulation
  "Add Binary",
  "Reverse Bits",
  "Number of 1 Bits",
  "Single Number",
  "Single Number II",
  "Bitwise AND of Numbers Range",
  // Math
  "Palindrome Number",
  "Plus One",
  "Factorial Trailing Zeroes",
  "Sqrt(x)",
  "Pow(x, n)",
  "Max Points on a Line",
  // 1D DP
  "Climbing Stairs",
  "House Robber",
  "Word Break",
  "Coin Change",
  "Longest Increasing Subsequence",
  // Multidimensional DP
  "Triangle",
  "Minimum Path Sum",
  "Unique Paths II",
  "Longest Palindromic Substring",
  "Interleaving String",
  "Edit Distance",
  "Best Time to Buy and Sell Stock III",
  "Best Time to Buy and Sell Stock IV",
  "Maximal Square",
];

function slugifyTitle(title: string): string {
  // Remove selected punctuation without spacing, then replace remaining non-alphanumerics with '-'
  return title
    .toLowerCase()
    .replace(/[()',]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateDifficulty(): "EASY" | "MEDIUM" | "HARD" {
  const r = Math.random();
  if (r < 0.5) return "EASY";
  if (r < 0.85) return "MEDIUM";
  return "HARD";
}

function generateMinutes(difficulty: "EASY" | "MEDIUM" | "HARD"): number {
  if (difficulty === "EASY") return 5 + Math.floor(Math.random() * 15); // 5-19
  if (difficulty === "MEDIUM") return 15 + Math.floor(Math.random() * 25); // 15-39
  return 25 + Math.floor(Math.random() * 35); // 25-59
}

function generateTags(): string[] {
  const pool = [
    "array",
    "two-pointer",
    "binary-search",
    "dp",
    "graph",
    "greedy",
    "stack",
    "queue",
    "hashmap",
    "heap",
    "math",
  ];
  const count = 1 + Math.floor(Math.random() * 3);
  const chosen = new Set<string>();
  while (chosen.size < count) chosen.add(randomChoice(pool));
  return [...chosen];
}

function randomPastDate(withinDays: number): Date {
  const now = Date.now();
  const spanMs = withinDays * 24 * 60 * 60 * 1000;
  const rand = Math.random();
  // Bias slightly toward recent
  const bias = Math.pow(rand, 1.7);
  const delta = Math.floor(bias * spanMs);
  return new Date(now - delta);
}

async function getOrCreateUser(provider: string, providerAccountId: string) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query<{ id: number }>(
      `INSERT INTO users (provider, provider_account_id, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider, provider_account_id)
       DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [provider, providerAccountId, "Mock User"]
    );
    await client.query("COMMIT");
    return res.rows[0].id;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function resetProblemsForUser(userId: number) {
  await pool.query(`DELETE FROM problems WHERE user_id = $1`, [userId]);
}

async function insertMockProblems(userId: number, count: number, days: number) {
  const rows: Array<{
    url: string;
    title: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    tags: string[];
    minutes: number;
    createdAt: Date;
  }> = [];
  const samples: Array<{
    url: string;
    sampledTitle: string;
    fallbackDifficulty: "EASY" | "MEDIUM" | "HARD";
    minutes: number;
    createdAt: Date;
  }> = [];
  for (let i = 1; i <= count; i++) {
    const sampledTitle = randomChoice(LEETCODE_150_TITLES);
    const slug = slugifyTitle(sampledTitle);
    const url = `https://leetcode.com/problems/${slug}/`;
    const fallbackDifficulty = generateDifficulty();
    const minutes = generateMinutes(fallbackDifficulty);
    const createdAt = randomPastDate(days);
    samples.push({ url, sampledTitle, fallbackDifficulty, minutes, createdAt });
  }

  const metas = await Promise.all(
    samples.map((s) =>
      fetchLeetCodeMeta(s.url).catch(() => ({
        title: null,
        difficulty: null,
        tags: [],
      }))
    )
  );

  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const m = metas[i] ?? { title: null, difficulty: null, tags: [] };
    rows.push({
      url: s.url,
      title: (m.title as string | null) ?? s.sampledTitle,
      difficulty:
        (m.difficulty as "EASY" | "MEDIUM" | "HARD" | null) ??
        s.fallbackDifficulty,
      tags:
        Array.isArray(m.tags) && m.tags.length
          ? (m.tags as string[])
          : generateTags(),
      minutes: s.minutes,
      createdAt: s.createdAt,
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const values: string[] = [];
    const params: any[] = [];
    let p = 1;
    for (const r of rows) {
      values.push(
        `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`
      );
      params.push(
        r.url,
        r.title,
        r.difficulty,
        r.tags,
        r.minutes,
        r.createdAt,
        userId
      );
    }
    await client.query(
      `INSERT INTO problems (url, title, difficulty, tags, minutes_to_solve, created_at, user_id)
       VALUES ${values.join(", ")}`,
      params
    );
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function main() {
  const opts = parseCliOptions(process.argv);
  await ensureInitialized({ allowMigrate: true });
  const userId = await getOrCreateUser(opts.provider, opts.providerAccountId);
  if (opts.deleteOnly) {
    // eslint-disable-next-line no-console
    console.log(`[mock] Deleting all problems for user ${userId}`);
    await resetProblemsForUser(userId);
    // eslint-disable-next-line no-console
    console.log(`[mock] Done.`);
    return;
  }
  if (opts.reset) {
    // eslint-disable-next-line no-console
    console.log(`[mock] Resetting existing problems for user ${userId}`);
    await resetProblemsForUser(userId);
  }
  // eslint-disable-next-line no-console
  console.log(
    `[mock] Inserting ${opts.count} problems within the last ${opts.days} days for user ${userId}`
  );
  await insertMockProblems(userId, opts.count, opts.days);
  // eslint-disable-next-line no-console
  console.log(`[mock] Done.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
