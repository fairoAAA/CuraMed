import type { AdBanner, AdPlacement } from '@/types';

export const MOCK_BANNERS: AdBanner[] = [
  {
    id: 'top-promo-1',
    placement: 'top_bar',
    title: '📢 Profilaktika oyligi',
    subtitle: '1-15 Noyabr kunlari 40 yoshdan oshgan fuqarolar uchun poliklinikada bepul EKG va qon tahlili o\'tkazilmoqda!',
    badgeText: 'Muhim aksiya',
    actionText: 'Batafsil bilish',
    actionUrl: '#',
    sponsorName: 'Tuman Tibbiyot Birlashmasi',
    isSponsored: false,
    active: true,
  },
  {
    id: 'hero-ad-1',
    placement: 'home_hero',
    title: 'Apex Med — Ixtiyoriy tibbiy sug\'urta',
    subtitle: 'Oila a\'zolaringiz uchun tezkor tibbiy xizmatlar, statsionar qoplama va laboratoriya tekshiruvlariga 20% chegirma.',
    badgeText: 'Hamkor reklama',
    actionText: 'Kompaniya saytiga o\'tish',
    actionUrl: 'https://example.com/apexmed',
    bgColor: 'from-blue-600 via-indigo-700 to-blue-900',
    sponsorName: 'Apex Insurance AJ',
    isSponsored: true,
    active: true,
  },
  {
    id: 'hero-ad-2',
    placement: 'home_hero',
    title: 'Milliy Emlash Dasturi: Farzandingizni himoyalang',
    subtitle: 'Poliklinikamizda 1-bosqich profilaktik emlash vaksinalari (JSST sertifikatiga ega) mavjud. Pediatr qabuliga yoziling.',
    badgeText: 'Ijtimoiy aksiya',
    actionText: 'Pediatr qabuli',
    actionUrl: '/specialties/pediatrician/doctors',
    bgColor: 'from-emerald-600 via-teal-700 to-cyan-900',
    sponsorName: 'Sog\'liqni Saqlash Vazirligi',
    isSponsored: false,
    active: true,
  },
  {
    id: 'sidebar-ad-1',
    placement: 'sidebar_card',
    title: 'E-Laboratoriya: Natijalar smartfonda',
    subtitle: 'Tahlil natijalaringiz tayyor bo\'lishi bilan SMS va telegram orqali yuboriladi.',
    badgeText: 'Hamkorlik',
    actionText: 'Xizmatga ulanish',
    actionUrl: '#',
    sponsorName: 'BioCheck Diagnostika',
    isSponsored: true,
    active: true,
  },
  {
    id: 'footer-ad-1',
    placement: 'footer_banner',
    title: 'Sog\'lom turmush tarzi — uzoq umr garovi',
    subtitle: 'Kuniga 30 daqiqa piyoda yurish yurak-qon tomir kasalliklari xavfini 40% ga kamaytiradi.',
    badgeText: 'Foydali maslahat',
    actionText: 'Shifokor tavsiyalari',
    actionUrl: '/specialties/cardiologist/doctors',
    sponsorName: 'Salomatlik Markazi',
    isSponsored: false,
    active: true,
  },
];

class BannerService {
  private banners: AdBanner[] = [...MOCK_BANNERS];

  async getBannersByPlacement(placement: AdPlacement): Promise<AdBanner[]> {
    return this.banners.filter(b => b.placement === placement && b.active);
  }

  async getAllBanners(): Promise<AdBanner[]> {
    return [...this.banners];
  }

  async toggleBanner(id: string): Promise<void> {
    const banner = this.banners.find(b => b.id === id);
    if (banner) {
      banner.active = !banner.active;
    }
  }
}

export const bannerService = new BannerService();
