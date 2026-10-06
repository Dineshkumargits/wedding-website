import prakashBellaRaw from './invitations/prakash-bella.json';
import sanjayFathimaRaw from './invitations/sanjay-fathima.json';

export interface PersonParents {
  line1: string;
  line2: string;
  city: string;
}

export interface PersonDetails {
  fullName: string;
  shortName: string;
  qualification: string;
  parents: PersonParents;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface EventDetail {
  tag: string;
  title: string;
  description: string;
  date: string;
  time: string;
  invitationTimeLabel: string;
  venueName: string;
  venueLocation: string;
}

export interface WeddingConfig {
  id?: string;
  meta: {
    siteTitle: string;
    siteDescription: string;
    ogLocale: string;
  };
  couple: {
    initials: string;
    displayNames: string;
    groom: PersonDetails;
    bride: PersonDetails;
    heroImage: ImageAsset;
  };
  invitationCard: {
    scannedImage: ImageAsset;
    topScripture: {
      verse: string;
      citation: string;
    };
    cardTitle: string;
    solicitationText: string;
    connector: string;
    compliments: {
      label: string;
      from: string;
    };
  };
  wedding: {
    dateTimeIso: string;
    dateFormatted: string;
    dateNumeric: string;
    dateFormal: string;
    dateShort: string;
    summaryLocation: string;
    scripture: {
      quote: string;
      reference: string;
    };
  };
  events: {
    ceremony?: EventDetail;
    reception?: EventDetail;
    list?: EventDetail[];
    [key: string]: any;
  };
  location: {
    addressTitle: string;
    googleMapsUrl: string;
    mapEmbedSrc: string;
    qrImage: ImageAsset;
  };
  music: {
    src: string;
    autoplayHintPlaying: string;
    autoplayHintPaused: string;
  };
  sections: {
    hero: {
      subtitle: string;
      connector: string;
      scrollCue: string;
    };
    countdown: {
      eyebrow: string;
      completedTitle: string;
      completedMessage: string;
    };
    invitation: {
      eyebrow: string;
      title: string;
    };
    venue: {
      eyebrow: string;
      title: string;
      navigateButton: string;
      qrCardTitle: string;
      qrCardSubtitle: string;
      qrCardBadge: string;
      qrModalTitle: string;
      qrModalSubtitle: string;
      qrModalButton: string;
    };
    rsvp: {
      eyebrow: string;
      title: string;
      heading: string;
      deadlineNotice: string;
    };
    guestbook: {
      eyebrow: string;
      title: string;
      formHeading: string;
      formSubtitle: string;
    };
    footer: {
      message: string;
    };
  };
}

export const prakashBellaConfig: WeddingConfig = prakashBellaRaw as unknown as WeddingConfig;
export const sanjayFathimaConfig: WeddingConfig = sanjayFathimaRaw as unknown as WeddingConfig;

export const INVITATIONS: Record<string, WeddingConfig> = {
  'prakash-bella': prakashBellaConfig,
  'sanjay-fathima': sanjayFathimaConfig,
};

/**
 * Resolves the wedding config based on domain/hostname or explicit slug.
 * If the host matches "prakash-bella" (e.g. prakash-bella.com, prakash-bella.vercel.app),
 * it returns Prakash & Bella's data.
 * If "sanjay-fathima", returns Sanjay & Fathima's data.
 * Defaults to Prakash & Bella.
 */
export function getWeddingConfig(domainOrSlug?: string | null): WeddingConfig {
  if (!domainOrSlug) {
    return prakashBellaConfig;
  }
  const clean = domainOrSlug.toLowerCase();
  if (clean.includes('sanjay') || clean.includes('fathima')) {
    return sanjayFathimaConfig;
  }
  if (clean.includes('prakash') || clean.includes('bella')) {
    return prakashBellaConfig;
  }
  return INVITATIONS[clean] || prakashBellaConfig;
}

// Default export uses prakashBellaConfig as requested
export const weddingConfig: WeddingConfig = prakashBellaConfig;
export default weddingConfig;
