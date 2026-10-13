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
      title: 'Operation Blockout — Boycott silence. Reclaim attention.',
      description:
        'A community-led boycott directory for people choosing to withdraw follows, views, and spending from celebrities they believe have stayed silent about the genocide in Gaza.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/search') {
    return {
      title: 'Search the directory | Operation Blockout',
      description:
        'Search public Instagram usernames, review each account’s statements, and decide whether to boycott or block.',
      robots: 'noindex, follow',
    };
  }

  if (pathname === '/blocked') {
    return {
      title: 'Your Blockout list | Operation Blockout',
      description:
        'Keep a private record of your boycott choices in this browser. No Instagram actions are automated.',
      robots: 'noindex, nofollow',
    };
  }

  if (pathname === '/story') {
    return {
      title: 'Palestinian history timeline | Operation Blockout',
      description:
        'A sourced timeline of selected events, agreements, and public records in Palestinian history.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/about') {
    return {
      title: 'Why Operation Blockout | About and methodology',
      description:
        'Why Operation Blockout exists, what the directory does and does not verify, and how the Palestinian history timeline is sourced.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/donate' && features.donate) {
    return {
      title: 'Donate | Operation Blockout',
      description:
        'Donation information shared by Operation Blockout after destination review.',
      robots: 'index, follow',
    };
  }

  if (pathname === '/stores-apps' && features.storesApps) {
    return {
      title: 'Stores and apps | Operation Blockout',
      description:
        'Official publisher pages and verified store listings shared by Operation Blockout.',
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
      title: `@${username} | Operation Blockout`,
      description: `Review the directory entry for @${username} and check the account’s public statements for yourself.`,
      robots: 'index, follow',
    };
  }

  return {
    title: 'Page not found | Operation Blockout',
    description: 'This Operation Blockout page could not be found.',
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
