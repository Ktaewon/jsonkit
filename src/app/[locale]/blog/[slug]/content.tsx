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

export function BlogPostContent({ slug, locale }: { slug: string; locale: string }) {
  const key = `${locale}/${slug}`;

  switch (key) {
    case 'ko/json-format-guide':
      return <JsonFormatGuideKo />;
    case 'ko/json-vs-yaml':
      return <JsonVsYamlKo />;
    case 'ko/jsonpath-tutorial':
      return <JsonpathTutorialKo />;
    case 'ko/json-validation-guide':
      return <JsonValidationGuideKo />;
    case 'ko/json-tree-viewer':
      return <JsonTreeViewerKo />;
    case 'ko/json-diff-comparison':
      return <JsonDiffComparisonKo />;
    case 'ko/json-escape-unescape':
      return <JsonEscapeUnescapeKo />;
    case 'ko/json-repair-guide':
      return <JsonRepairGuideKo />;
    case 'ko/json-schema-intro':
      return <JsonSchemaIntroKo />;
    case 'ko/json-to-type-codegen':
      return <JsonToTypeCodegenKo />;
    case 'ko/json-visualization':
      return <JsonVisualizationKo />;
    case 'en/json-format-guide':
      return <JsonFormatGuideEn />;
    case 'en/json-vs-yaml':
      return <JsonVsYamlEn />;
    case 'en/jsonpath-tutorial':
      return <JsonpathTutorialEn />;
    case 'en/json-validation-guide':
      return <JsonValidationGuideEn />;
    case 'en/json-tree-viewer':
      return <JsonTreeViewerEn />;
    case 'en/json-diff-comparison':
      return <JsonDiffComparisonEn />;
    case 'en/json-escape-unescape':
      return <JsonEscapeUnescapeEn />;
    case 'en/json-repair-guide':
      return <JsonRepairGuideEn />;
    case 'en/json-schema-intro':
      return <JsonSchemaIntroEn />;
    case 'en/json-to-type-codegen':
      return <JsonToTypeCodegenEn />;
    case 'en/json-visualization':
      return <JsonVisualizationEn />;
    default:
      return null;
  }
}
