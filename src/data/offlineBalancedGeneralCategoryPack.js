import BALANCED_GENERAL_CATEGORY_ROWS from './offlineBalancedGeneralCategoryRows.json';

function buildLanguageQuestion(row, language, content) {
  const sharedImage =
    typeof row.image_url === 'string' && row.image_url.trim()
      ? {
          image_url: row.image_url.trim(),
          image_alt:
            typeof content.image_alt === 'string' && content.image_alt.trim()
              ? content.image_alt.trim()
              : typeof row.image_alt === 'string' && row.image_alt.trim()
              ? row.image_alt.trim()
              : null,
        }
      : {};

  return {
    id: `general-${row.slug}${language === 'en' ? '-en' : ''}`,
    difficulty: row.difficulty ?? 'mittel',
    category: row.category,
    language,
    ...sharedImage,
    ...content,
  };
}

const BALANCED_GENERAL_CATEGORY_PACK = BALANCED_GENERAL_CATEGORY_ROWS.flatMap((row) => [
  buildLanguageQuestion(row, 'de', row.de),
  buildLanguageQuestion(row, 'en', row.en),
]);

export default BALANCED_GENERAL_CATEGORY_PACK;
