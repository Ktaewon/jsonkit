import JsonFormatGuideKo from '@/content/blog/ko/json-format-guide.mdx';
import JsonVsYamlKo from '@/content/blog/ko/json-vs-yaml.mdx';
import JsonpathTutorialKo from '@/content/blog/ko/jsonpath-tutorial.mdx';
import JsonValidationGuideKo from '@/content/blog/ko/json-validation-guide.mdx';
import JsonTreeViewerKo from '@/content/blog/ko/json-tree-viewer.mdx';
import JsonDiffComparisonKo from '@/content/blog/ko/json-diff-comparison.mdx';
import JsonEscapeUnescapeKo from '@/content/blog/ko/json-escape-unescape.mdx';
import JsonRepairGuideKo from '@/content/blog/ko/json-repair-guide.mdx';
import JsonSchemaIntroKo from '@/content/blog/ko/json-schema-intro.mdx';
import JsonToTypeCodegenKo from '@/content/blog/ko/json-to-type-codegen.mdx';
import JsonVisualizationKo from '@/content/blog/ko/json-visualization.mdx';

import JsonFormatGuideEn from '@/content/blog/en/json-format-guide.mdx';
import JsonVsYamlEn from '@/content/blog/en/json-vs-yaml.mdx';
import JsonpathTutorialEn from '@/content/blog/en/jsonpath-tutorial.mdx';
import JsonValidationGuideEn from '@/content/blog/en/json-validation-guide.mdx';
import JsonTreeViewerEn from '@/content/blog/en/json-tree-viewer.mdx';
import JsonDiffComparisonEn from '@/content/blog/en/json-diff-comparison.mdx';
import JsonEscapeUnescapeEn from '@/content/blog/en/json-escape-unescape.mdx';
import JsonRepairGuideEn from '@/content/blog/en/json-repair-guide.mdx';
import JsonSchemaIntroEn from '@/content/blog/en/json-schema-intro.mdx';
import JsonToTypeCodegenEn from '@/content/blog/en/json-to-type-codegen.mdx';
import JsonVisualizationEn from '@/content/blog/en/json-visualization.mdx';

import JsonFormatGuideJa from '@/content/blog/ja/json-format-guide.mdx';
import JsonVsYamlJa from '@/content/blog/ja/json-vs-yaml.mdx';
import JsonpathTutorialJa from '@/content/blog/ja/jsonpath-tutorial.mdx';
import JsonValidationGuideJa from '@/content/blog/ja/json-validation-guide.mdx';
import JsonTreeViewerJa from '@/content/blog/ja/json-tree-viewer.mdx';
import JsonDiffComparisonJa from '@/content/blog/ja/json-diff-comparison.mdx';
import JsonEscapeUnescapeJa from '@/content/blog/ja/json-escape-unescape.mdx';
import JsonRepairGuideJa from '@/content/blog/ja/json-repair-guide.mdx';
import JsonSchemaIntroJa from '@/content/blog/ja/json-schema-intro.mdx';
import JsonToTypeCodegenJa from '@/content/blog/ja/json-to-type-codegen.mdx';
import JsonVisualizationJa from '@/content/blog/ja/json-visualization.mdx';

import JsonFormatGuideZh from '@/content/blog/zh/json-format-guide.mdx';
import JsonVsYamlZh from '@/content/blog/zh/json-vs-yaml.mdx';
import JsonpathTutorialZh from '@/content/blog/zh/jsonpath-tutorial.mdx';
import JsonValidationGuideZh from '@/content/blog/zh/json-validation-guide.mdx';
import JsonTreeViewerZh from '@/content/blog/zh/json-tree-viewer.mdx';
import JsonDiffComparisonZh from '@/content/blog/zh/json-diff-comparison.mdx';
import JsonEscapeUnescapeZh from '@/content/blog/zh/json-escape-unescape.mdx';
import JsonRepairGuideZh from '@/content/blog/zh/json-repair-guide.mdx';
import JsonSchemaIntroZh from '@/content/blog/zh/json-schema-intro.mdx';
import JsonToTypeCodegenZh from '@/content/blog/zh/json-to-type-codegen.mdx';
import JsonVisualizationZh from '@/content/blog/zh/json-visualization.mdx';

import JsonFormatGuideRu from '@/content/blog/ru/json-format-guide.mdx';
import JsonVsYamlRu from '@/content/blog/ru/json-vs-yaml.mdx';
import JsonpathTutorialRu from '@/content/blog/ru/jsonpath-tutorial.mdx';
import JsonValidationGuideRu from '@/content/blog/ru/json-validation-guide.mdx';
import JsonTreeViewerRu from '@/content/blog/ru/json-tree-viewer.mdx';
import JsonDiffComparisonRu from '@/content/blog/ru/json-diff-comparison.mdx';
import JsonEscapeUnescapeRu from '@/content/blog/ru/json-escape-unescape.mdx';
import JsonRepairGuideRu from '@/content/blog/ru/json-repair-guide.mdx';
import JsonSchemaIntroRu from '@/content/blog/ru/json-schema-intro.mdx';
import JsonToTypeCodegenRu from '@/content/blog/ru/json-to-type-codegen.mdx';
import JsonVisualizationRu from '@/content/blog/ru/json-visualization.mdx';

const contentMap: Record<string, React.ComponentType> = {
  'ko/json-format-guide': JsonFormatGuideKo,
  'ko/json-vs-yaml': JsonVsYamlKo,
  'ko/jsonpath-tutorial': JsonpathTutorialKo,
  'ko/json-validation-guide': JsonValidationGuideKo,
  'ko/json-tree-viewer': JsonTreeViewerKo,
  'ko/json-diff-comparison': JsonDiffComparisonKo,
  'ko/json-escape-unescape': JsonEscapeUnescapeKo,
  'ko/json-repair-guide': JsonRepairGuideKo,
  'ko/json-schema-intro': JsonSchemaIntroKo,
  'ko/json-to-type-codegen': JsonToTypeCodegenKo,
  'ko/json-visualization': JsonVisualizationKo,
  'en/json-format-guide': JsonFormatGuideEn,
  'en/json-vs-yaml': JsonVsYamlEn,
  'en/jsonpath-tutorial': JsonpathTutorialEn,
  'en/json-validation-guide': JsonValidationGuideEn,
  'en/json-tree-viewer': JsonTreeViewerEn,
  'en/json-diff-comparison': JsonDiffComparisonEn,
  'en/json-escape-unescape': JsonEscapeUnescapeEn,
  'en/json-repair-guide': JsonRepairGuideEn,
  'en/json-schema-intro': JsonSchemaIntroEn,
  'en/json-to-type-codegen': JsonToTypeCodegenEn,
  'en/json-visualization': JsonVisualizationEn,
  'ja/json-format-guide': JsonFormatGuideJa,
  'ja/json-vs-yaml': JsonVsYamlJa,
  'ja/jsonpath-tutorial': JsonpathTutorialJa,
  'ja/json-validation-guide': JsonValidationGuideJa,
  'ja/json-tree-viewer': JsonTreeViewerJa,
  'ja/json-diff-comparison': JsonDiffComparisonJa,
  'ja/json-escape-unescape': JsonEscapeUnescapeJa,
  'ja/json-repair-guide': JsonRepairGuideJa,
  'ja/json-schema-intro': JsonSchemaIntroJa,
  'ja/json-to-type-codegen': JsonToTypeCodegenJa,
  'ja/json-visualization': JsonVisualizationJa,
  'zh/json-format-guide': JsonFormatGuideZh,
  'zh/json-vs-yaml': JsonVsYamlZh,
  'zh/jsonpath-tutorial': JsonpathTutorialZh,
  'zh/json-validation-guide': JsonValidationGuideZh,
  'zh/json-tree-viewer': JsonTreeViewerZh,
  'zh/json-diff-comparison': JsonDiffComparisonZh,
  'zh/json-escape-unescape': JsonEscapeUnescapeZh,
  'zh/json-repair-guide': JsonRepairGuideZh,
  'zh/json-schema-intro': JsonSchemaIntroZh,
  'zh/json-to-type-codegen': JsonToTypeCodegenZh,
  'zh/json-visualization': JsonVisualizationZh,
  'ru/json-format-guide': JsonFormatGuideRu,
  'ru/json-vs-yaml': JsonVsYamlRu,
  'ru/jsonpath-tutorial': JsonpathTutorialRu,
  'ru/json-validation-guide': JsonValidationGuideRu,
  'ru/json-tree-viewer': JsonTreeViewerRu,
  'ru/json-diff-comparison': JsonDiffComparisonRu,
  'ru/json-escape-unescape': JsonEscapeUnescapeRu,
  'ru/json-repair-guide': JsonRepairGuideRu,
  'ru/json-schema-intro': JsonSchemaIntroRu,
  'ru/json-to-type-codegen': JsonToTypeCodegenRu,
  'ru/json-visualization': JsonVisualizationRu,
};

export function BlogPostContent({ slug, locale }: { slug: string; locale: string }) {
  const Component = contentMap[`${locale}/${slug}`];
  if (!Component) return null;
  return <Component />;
}
