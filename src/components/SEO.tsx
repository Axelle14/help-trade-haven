import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SITE = "https://help-trade-haven.lovable.app";
const DEFAULT_DESC =
  "Service Swap is the community marketplace for bartering skills. Offer what you do best, get the help you need — no money required.";
const DEFAULT_IMG =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/efa4b206-dda0-4c6c-8c70-6f7b2f04e45d/id-preview-5ef0c80b--b5a80c49-653b-40f3-8ad1-6e20a35a6de4.lovable.app-1777012181814.png";

export const SEO = ({ title, description = DEFAULT_DESC, canonical, image = DEFAULT_IMG, jsonLd }: Props) => {
  const url = canonical?.startsWith("http") ? canonical : `${SITE}${canonical ?? ""}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
