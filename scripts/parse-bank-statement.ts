import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

// Load ANTHROPIC_API_KEY from .env.local if not already set
if (!process.env.ANTHROPIC_API_KEY) {
  try {
    const envPath = path.resolve(__dirname, "..", ".env.local");
    const envContent = readFileSync(envPath, "utf-8");
    const match = envContent.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) {
      process.env.ANTHROPIC_API_KEY = match[1].trim();
    }
  } catch {
    // .env.local not found — rely on Claude Code CLI auth
  }
}

const CATEGORIES = [
  "Grocery",
  "Takeout",
  "Misc",
  "Shopping",
  "Travel",
  "Gifts",
  "Petrol",
  "Utilities",
  "Car",
];

const TAGS = [
  "Costco",
  "Aldi",
  "Tire Shop",
  "Walmart",
  "Giant Eagle",
  "Sams Club",
  "Amazon",
  "Shein",
  "Pitts Halal Brothers",
  "Joe & Pie",
  "98K",
  "Others",
];

const MEMBERS = ["Usman", "Anoosha"];

const PARSING_RULES = `Rules:
1. Use default amounts for expenses/debits (withdrawals)
2. For Credit Card Statement record negative amount as negative (Append 'refund' in description) but do not record income.
3. For Debit Card Statement, record positive amount as negative (Append 'refund' in description) but do not record income.
4. Parse dates to ISO format (YYYY-MM-DD)
5. Match each transaction to the BEST category and tag from the lists provided
6. If no good match for category, use "Misc". If no good match for tag, use "Others".
7. Clean up merchant names (remove extra info - keep only the name). This will be the Description field.
8. Skip these transactions:
   - Any transaction containing: "credit card", "bill pay", "payment".
   - Payments to credit card companies (Chase, Discover, Capital One, Amex, etc.)
   - Transfers between accounts
   - Any transaction that looks like it's moving money between accounts rather than spending money
9. Do not record credit card payments as expenses.
10. All amounts should be positive numbers (absolute values) unless it's a refund.`;

function startSpinner(text: string) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const interval = setInterval(() => {
    process.stdout.write(`\r${frames[i++ % frames.length]} ${text}`);
  }, 80);
  return {
    stop: (finalText?: string) => {
      clearInterval(interval);
      process.stdout.write(`\r${finalText ?? `✓ ${text}`}\n`);
    },
    update: (newText: string) => {
      text = newText;
    },
  };
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: npx tsx scripts/parse-bank-statement.ts <pdf-path> [--output <output-path>] [--member <member-name>]"
    );
    process.exit(1);
  }

  const pdfPath = path.resolve(args[0]);

  // Parse --output flag
  let outputPath: string | undefined;
  const outputIdx = args.indexOf("--output");
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    outputPath = path.resolve(args[outputIdx + 1]);
  }

  // Parse --member flag
  let member = "Usman";
  const memberIdx = args.indexOf("--member");
  if (memberIdx !== -1 && args[memberIdx + 1]) {
    member = args[memberIdx + 1];
  }

  // Default output path: ./scripts/output/<input-name>-expenses.csv
  if (!outputPath) {
    const parsed = path.parse(pdfPath);
    const outputDir = path.resolve(__dirname, "output");
    const { mkdirSync } = await import("fs");
    mkdirSync(outputDir, { recursive: true });
    outputPath = path.join(outputDir, `${parsed.name}-expenses.csv`);
  }

  const categoryColumns = CATEGORIES.join(",");

  const prompt = `You are a bank statement parser. Read the PDF file at "${pdfPath}" and extract ALL transactions.

Available categories: ${CATEGORIES.join(", ")}
Available tags: ${TAGS.join(", ")}
Available members: ${MEMBERS.join(", ")}
Default member: ${member}

${PARSING_RULES}

Output the transactions as a CSV in this EXACT wide format:

Date,Description,${categoryColumns},Tag,Member

Rules for the CSV:
- One row per transaction
- Date must be in ISO format (YYYY-MM-DD)
- For each row, put the amount in ONLY the matching category column, leave other category columns empty
- Tag should match the best tag from the list above
- Member defaults to "${member}"
- Do NOT include any markdown formatting, code blocks, or explanation - ONLY the raw CSV text
- The first line must be the header row exactly as shown above

Example rows:
Date,Description,${categoryColumns},Tag,Member
2024-01-15,Walmart,50.00,,,,,,,Walmart,${member}
2024-01-16,Chipotle,,12.50,,,,,,,,Others,${member}

Now read the PDF and output the CSV.`;

  console.log(`\nParsing bank statement: ${pdfPath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Member: ${member}\n`);

  const spinner = startSpinner("Reading PDF and extracting transactions...");

  const conversation = query({
    options: {
      allowedTools: ["Read"],
      maxTurns: 5,
      permissionMode: "bypassPermissions",
    },
    prompt,
  });

  // Collect text from assistant messages and the final result
  let responseText = "";
  let turnCount = 0;

  for await (const message of conversation) {
    if (message.type === "assistant") {
      turnCount++;
      spinner.update(
        `Processing... (turn ${turnCount}) — reading and categorizing transactions`
      );
      // SDKAssistantMessage: text content is at message.message.content[]
      const assistantMsg = message as { message?: { content?: unknown[] } };
      if (assistantMsg.message && Array.isArray(assistantMsg.message.content)) {
        for (const block of assistantMsg.message.content as {
          type: string;
          text?: string;
        }[]) {
          if (block.type === "text" && block.text) {
            responseText += block.text;
          }
        }
      }
    }

    // SDKResultMessage: final result string
    if (message.type === "result") {
      const resultMsg = message as {
        subtype?: string;
        result?: string;
        errors?: string[];
      };
      if (resultMsg.subtype === "success" && resultMsg.result) {
        responseText = resultMsg.result;
      } else if (resultMsg.errors) {
        spinner.stop(`✗ Agent error: ${resultMsg.errors.join(", ")}`);
        process.exit(1);
      }
    }
  }

  // Try to find CSV content - look for the header row and everything after
  const headerPattern = `Date,Description,${categoryColumns},Tag,Member`;
  const headerIdx = responseText.indexOf(headerPattern);

  let csvContent: string;

  if (headerIdx !== -1) {
    // Extract from header to end, then clean up any trailing non-CSV content
    csvContent = responseText
      .slice(headerIdx)
      .replace(/```[\s\S]*$/, "")
      .trim();
  } else {
    // Fallback: clean markdown formatting and use the full response
    csvContent = responseText
      .replace(/```csv\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
  }

  if (!csvContent || csvContent.split("\n").length <= 1) {
    spinner.stop("✗ No transactions extracted. Raw response:");
    console.log(responseText.slice(0, 500));
    process.exit(1);
  }

  writeFileSync(outputPath, csvContent, "utf-8");

  const rowCount = csvContent.split("\n").length - 1;
  spinner.stop(`✓ Extracted ${rowCount} transactions`);
  console.log(`CSV saved to: ${outputPath}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
