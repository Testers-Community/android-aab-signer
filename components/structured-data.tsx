const siteUrl = "https://aab.testerscommunity.com";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Testers Community",
    url: "https://testerscommunity.com",
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/tc-icon.webp`,
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://github.com/Testers-Community",
    ],
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/#software`,
    name: "AAB Signer",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "Free online tool to sign Android App Bundle (AAB) files for Google Play Store submission. Open source and powered by GitHub Actions.",
    url: siteUrl,
    author: {
      "@type": "Organization",
      name: "Testers Community",
      url: "https://testerscommunity.com",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1500",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "Sign AAB files online",
      "No installation required",
      "100% free and open source",
      "Secure processing via GitHub Actions",
      "Immediate file deletion after signing",
      "No sign-up required",
      "Production-ready signed bundles",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "Is this really free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. GitHub Actions provides free compute for public repositories, and we pass that savings to you. There are no hidden fees, no premium tiers, and no rate limits.",
        },
      },
      {
        "@type": "Question",
        name: "Is it safe to upload my keystore?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Your keystore is uploaded securely via HTTPS, used only during the signing process, and deleted immediately after. The workflow runs in an isolated GitHub Actions environment that is destroyed after each job. You can verify this in our open-source code.",
        },
      },
      {
        "@type": "Question",
        name: "Why do I need to sign my AAB?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Google Play requires all apps to be signed with your private key. If you're using a build system that produces unsigned bundles, or if you need to re-sign an AAB, you'll need to sign it before uploading to Play Console.",
        },
      },
      {
        "@type": "Question",
        name: "What tools do you use for signing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We use jarsigner from the official Java SDK with SHA256withRSA signature algorithm - the same process Google recommends for signing Android App Bundles.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use this for production apps?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely! This tool produces production-ready signed bundles suitable for Google Play release. Thousands of developers use this tool for their production apps.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I get a keystore?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can generate one using Android Studio (Build > Generate Signed Bundle/APK) or the keytool command line utility. If you've previously published to Google Play, use the same keystore to maintain update compatibility.",
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${siteUrl}/#howto`,
    name: "How to Sign an Android App Bundle (AAB) Online",
    description: "Step-by-step guide to signing your Android AAB file using AAB Signer - a free online tool powered by GitHub Actions.",
    totalTime: "PT2M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    tool: [
      {
        "@type": "HowToTool",
        name: "Web browser",
      },
      {
        "@type": "HowToTool",
        name: "Android keystore file (.jks, .keystore, .p12, or .pfx)",
      },
      {
        "@type": "HowToTool",
        name: "Unsigned AAB file",
      },
    ],
    step: [
      {
        "@type": "HowToStep",
        name: "Upload Your Files",
        text: "Drop your unsigned AAB and keystore file. Everything stays secure until submission.",
        position: 1,
        url: `${siteUrl}/#step-1`,
      },
      {
        "@type": "HowToStep",
        name: "Secure Processing",
        text: "Files are temporarily uploaded to trigger a GitHub Actions workflow. Deleted immediately after.",
        position: 2,
        url: `${siteUrl}/#step-2`,
      },
      {
        "@type": "HowToStep",
        name: "Automated Signing",
        text: "GitHub Actions runs jarsigner to properly sign your bundle - the same tools Google recommends.",
        position: 3,
        url: `${siteUrl}/#step-3`,
      },
      {
        "@type": "HowToStep",
        name: "Download & Publish",
        text: "Get your signed AAB ready to upload directly to Google Play Console.",
        position: 4,
        url: `${siteUrl}/#step-4`,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteUrl}/#webpage`,
    name: "AAB Signer - Sign Android App Bundles Online Free",
    description: "Free online AAB signer for Android developers. Sign your Android App Bundle for Google Play in seconds. Open source, secure, powered by GitHub Actions.",
    url: siteUrl,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "AAB Signer",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "Android App Bundle Signing",
    },
    mainEntity: {
      "@id": `${siteUrl}/#software`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".hero-description"],
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "AAB Signer",
    url: siteUrl,
    description: "Free online tool to sign Android App Bundles for Google Play",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareAppSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
    </>
  );
}
