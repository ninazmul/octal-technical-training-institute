// JSON-LD Structured Data helpers for SEO
// Reference: https://schema.org/

export interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: string[];
}

export function generateOrganizationSchema(props: OrganizationSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: props.name,
    url: props.url,
    ...(props.logo && { logo: props.logo }),
    ...(props.description && { description: props.description }),
    ...(props.email && { email: props.email }),
    ...(props.phone && { telephone: props.phone }),
    ...(props.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: props.address,
        addressCountry: "BD",
      },
    }),
    ...(props.socialLinks &&
      props.socialLinks.length > 0 && { sameAs: props.socialLinks }),
  };
}

export interface CourseSchemaProps {
  name: string;
  description: string;
  provider: string;
  url: string;
  image?: string;
  price?: number;
  priceCurrency?: string;
  mode?: "Online" | "Offline";
  startDate?: string;
  duration?: string;
  category?: string;
}

export function generateCourseSchema(props: CourseSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: props.name,
    description: props.description,
    url: props.url,
    provider: {
      "@type": "EducationalOrganization",
      name: props.provider,
      url: "https://octal.edu.bd",
    },
    ...(props.image && { image: props.image }),
    ...(props.startDate && { startDate: props.startDate }),
    ...(props.duration && {
      timeRequired: props.duration,
    }),
    ...(props.category && {
      courseCode: props.category,
    }),
    ...(props.mode && {
      educationalCredentialAwarded: props.mode === "Online" ? "Online Certificate" : "Certificate",
      deliveryMode: props.mode === "Online" ? "online" : "onsite",
    }),
    ...(props.price !== undefined && {
      offers: {
        "@type": "Offer",
        price: props.price,
        priceCurrency: props.priceCurrency || "BDT",
        availability: "https://schema.org/InStock",
        url: props.url,
      },
    }),
  };
}

export interface CourseListSchemaProps {
  courses: {
    name: string;
    description: string;
    url: string;
    image?: string;
    price?: number;
  }[];
}

export function generateCourseListSchema(props: CourseListSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: props.courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        url: course.url,
        ...(course.image && { image: course.image }),
        ...(course.price !== undefined && {
          offers: {
            "@type": "Offer",
            price: course.price,
            priceCurrency: "BDT",
          },
        }),
        provider: {
          "@type": "EducationalOrganization",
          name: "Octal Technical Training Institute",
          url: "https://octal.edu.bd",
        },
      },
    })),
  };
}

export interface FAQSchemaProps {
  items: { question?: string | null; answer?: string | null }[];
}

export function generateFAQSchema(props: FAQSchemaProps) {
  if (!props.items || props.items.length === 0) return null;

  const validItems = props.items.filter(
    (item): item is { question: string; answer: string } =>
      Boolean(item.question && item.answer),
  );

  if (validItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: validItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

export function generateBreadcrumbSchema(props: BreadcrumbSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: props.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface WebSiteSearchSchema {
  siteUrl: string;
  searchUrl: string;
}

export function generateWebSiteSchema(props: WebSiteSearchSchema) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Octal Technical Training Institute",
    url: props.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${props.searchUrl}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
