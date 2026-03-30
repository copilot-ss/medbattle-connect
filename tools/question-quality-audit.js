const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvFile(filePath) {
  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.trim().startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=');
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)];
      })
  );
}

function normalizeLabel(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function analyzeQuestion(question) {
  const options = Array.isArray(question.options)
    ? question.options.map(normalizeLabel).filter(Boolean)
    : [];
  const correct = normalizeLabel(question.correct_answer);
  const lengths = options.map((option) => option.length);
  const maxLength = Math.max(...lengths, 0);
  const minLength = Math.min(...lengths, maxLength);
  const correctLength = correct.length;
  const maxLengthCount = lengths.filter((value) => value === maxLength).length;

  return {
    slug: question.slug,
    category: question.category,
    question: question.question,
    correct,
    options,
    correctLength,
    minLength,
    maxLength,
    uniqueLongestCorrect:
      correctLength === maxLength &&
      maxLengthCount === 1,
  };
}

function summarize(rows) {
  const analyzed = rows.map(analyzeQuestion);
  const uniqueLongest = analyzed.filter((row) => row.uniqueLongestCorrect);
  return {
    total: analyzed.length,
    uniqueLongestCorrect: uniqueLongest.length,
    share: analyzed.length
      ? Number((uniqueLongest.length / analyzed.length).toFixed(4))
      : 0,
    examples: uniqueLongest
      .sort((left, right) => (right.maxLength - right.minLength) - (left.maxLength - left.minLength))
      .slice(0, 10),
  };
}

async function fetchAllQuestions(supabase) {
  const allQuestions = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('questions')
      .select('slug, category, question, correct_answer, options')
      .range(from, from + batchSize - 1);

    if (error) {
      throw error;
    }
    if (!data?.length) {
      break;
    }

    allQuestions.push(...data);
    if (data.length < batchSize) {
      break;
    }
    from += batchSize;
  }

  return allQuestions;
}

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const env = loadEnvFile(path.join(rootDir, '.env'));
  const supabase = createClient(
    env.EXPO_PUBLIC_SUPABASE_URL,
    env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  const questions = await fetchAllQuestions(supabase);
  const prefixes = {
    easy_foundation: 'online-einfach-grundlagen-',
    precise: 'online-praezise-',
    explained: 'online-erklaert-',
    broad: 'online-breit-',
    focus: 'online-fokus-',
  };

  const report = {
    all: summarize(questions),
  };

  Object.entries(prefixes).forEach(([label, prefix]) => {
    report[label] = summarize(
      questions.filter((row) => String(row.slug || '').startsWith(prefix))
    );
  });

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
