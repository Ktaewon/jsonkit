import JsonFormatGuideKo from '@/content/blog/ko/json-format-guide.mdx';
import JsonVsYamlKo from '@/content/blog/ko/json-vs-yaml.mdx';
import JsonpathTutorialKo from '@/content/blog/ko/jsonpath-tutorial.mdx';
import JsonFormatGuideEn from '@/content/blog/en/json-format-guide.mdx';
import JsonVsYamlEn from '@/content/blog/en/json-vs-yaml.mdx';
import JsonpathTutorialEn from '@/content/blog/en/jsonpath-tutorial.mdx';

export function BlogPostContent({ slug, locale }: { slug: string; locale: string }) {
  const key = `${locale}/${slug}`;

  switch (key) {
    case 'ko/json-format-guide':
      return <JsonFormatGuideKo />;
    case 'ko/json-vs-yaml':
      return <JsonVsYamlKo />;
    case 'ko/jsonpath-tutorial':
      return <JsonpathTutorialKo />;
    case 'en/json-format-guide':
      return <JsonFormatGuideEn />;
    case 'en/json-vs-yaml':
      return <JsonVsYamlEn />;
    case 'en/jsonpath-tutorial':
      return <JsonpathTutorialEn />;
    default:
      return null;
  }
}
