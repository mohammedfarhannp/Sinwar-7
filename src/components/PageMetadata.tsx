import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { features } from '../config/features';

interface PageDescription {
  title: string;
  description: string;
  robots: string;
}

function describePage(pathname: string): PageDescription {
  if (pathname === '/') {
    return {
      title: 'Sinwar-7 — Personal account checklist',
      description:
        'A calm, community-maintained directory and personal account checklist.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/search') {
    return {
      title: 'Search accounts | Sinwar-7',
      description:
        'Search the community-maintained public account directory by username and category.',
      robots: 'noindex, follow',
    };
  }

  if (pathname === '/blocked') {
    return {
      title: 'Personal checklist | Sinwar-7',
      description:
        'Manage the private account checklist saved in this browser.',
      robots: 'noindex, nofollow',
    };
  }

  if (pathname === '/story') {
    return {
      title: 'Palestinian history timeline | Sinwar-7',
      description:
        'A sourced timeline of selected events, agreements, and public records in Palestinian history.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/about') {
    return {
      title: 'About and methodology | Sinwar-7',
      description:
        'How Sinwar-7 selects public records, attributes findings, and maintains its timeline.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/donate' && features.donate) {
    return {
      title: 'Donate | Sinwar-7',
      description:
        'Donation information shared by Sinwar-7 after destination review.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/stores-apps' && features.storesApps) {
    return {
      title: 'Stores and apps | Sinwar-7',
      description:
        'Official publisher pages and verified store listings shared by Sinwar-7.',
      robots: 'index, follow',
    };
  }

  const profileMatch = /^\/profile\/([^/]+)\/?$/.exec(pathname);
  if (profileMatch) {
    let username = profileMatch[1];
    try {
      username = decodeURIComponent(username);
    } catch {
      // Keep the path segment as displayed when it is not valid encoded text.
    }

    return {
      title: `@${username} | Sinwar-7`,
      description: `Review the public directory entry for @${username}.`,
      robots: 'index, follow',
    };
  }

  return {
    title: 'Page not found | Sinwar-7',
    description: 'This Sinwar-7 page could not be found.',
    robots: 'noindex, nofollow',
  };
}

function setMetaContent(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.content = content;
}

export function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = describePage(pathname);
    const canonicalUrl = new URL(pathname, window.location.origin).toString();

    document.title = page.title;
    setMetaContent('name', 'description', page.description);
    setMetaContent('name', 'robots', page.robots);
    setMetaContent('property', 'og:type', 'website');
    setMetaContent('property', 'og:title', page.title);
    setMetaContent('property', 'og:description', page.description);
    setMetaContent('property', 'og:url', canonicalUrl);
    setMetaContent('name', 'twitter:card', 'summary');
    setMetaContent('name', 'twitter:title', page.title);
    setMetaContent('name', 'twitter:description', page.description);

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;
  }, [pathname]);

  return null;
}
