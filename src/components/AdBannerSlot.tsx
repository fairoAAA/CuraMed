import React, { useState, useEffect } from 'react';
import { bannerService } from '@/services/mock/bannerService';
import type { AdBanner, AdPlacement } from '@/types';
import { ExternalLink, X, Megaphone, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AdBannerSlotProps {
  placement: AdPlacement;
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({ placement, className = '' }) => {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    bannerService.getBannersByPlacement(placement).then(setBanners);
  }, [placement]);

  if (banners.length === 0 || dismissed) return null;

  const current = banners[currentIndex % banners.length];

  // ── Top Slim Notification / Partner Bar ──
  if (placement === 'top_bar') {
    return (
      <aside aria-label="E'lon va reklama" className={`bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs sm:text-sm py-2 px-4 shadow-sm border-b border-indigo-700/50 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <span className="flex-none p-1 rounded-md bg-white/10 text-amber-300">
              <Megaphone className="w-3.5 h-3.5" />
            </span>
            <span className="bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-400/30 flex-none">
              {current.badgeText || (current.isSponsored ? 'Reklama' : 'E\'lon')}
            </span>
            <span className="font-semibold truncate text-white">{current.title}</span>
            <span className="hidden md:inline text-blue-200 text-xs truncate">— {current.subtitle}</span>
          </div>

          <div className="flex items-center gap-3 flex-none">
            {current.actionUrl?.startsWith('http') ? (
              <a
                href={current.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-amber-300 hover:text-amber-200 hover:underline"
              >
                {current.actionText} <ExternalLink className="w-3 h-3" />
              </a>
            ) : current.actionUrl ? (
              <Link
                to={current.actionUrl}
                className="inline-flex items-center gap-1 font-medium text-amber-300 hover:text-amber-200 hover:underline"
              >
                {current.actionText} <ChevronRight className="w-3 h-3" />
              </Link>
            ) : null}

            <button
              onClick={() => setDismissed(true)}
              className="text-white/70 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
              title="Yopish"
              aria-label="E'lonni yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // ── Home Hero Promotional Banner Carousel / Showcase ──
  if (placement === 'home_hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl shadow-lg border border-slate-200/80 bg-gradient-to-br ${current.bgColor || 'from-brand-700 via-indigo-700 to-slate-900'} text-white p-6 md:p-8 ${className}`}>
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-48 h-48 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 text-white">
                <Sparkles className="w-3 h-3 text-amber-300" />
                {current.badgeText || (current.isSponsored ? 'Hamkor Reklama' : 'Foydali Dastur')}
              </span>
              <span className="text-xs text-white/70">
                {current.sponsorName}
              </span>
            </div>

            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mb-2 leading-tight">
              {current.title}
            </h3>
            <p className="text-white/85 text-sm md:text-base leading-relaxed">
              {current.subtitle}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {current.actionUrl?.startsWith('http') ? (
              <a
                href={current.actionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white text-brand-900 hover:bg-brand-50 shadow-md transition-all active:scale-95 text-sm"
              >
                {current.actionText} <ExternalLink className="w-4 h-4" />
              </a>
            ) : current.actionUrl ? (
              <Link
                to={current.actionUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white text-brand-900 hover:bg-brand-50 shadow-md transition-all active:scale-95 text-sm"
              >
                {current.actionText} <ChevronRight className="w-4 h-4" />
              </Link>
            ) : null}

            {banners.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2 sm:pt-0">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                    aria-label={`Banner ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Sidebar Compact Card ──
  if (placement === 'sidebar_card') {
    return (
      <div className={`rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-4 shadow-sm relative overflow-hidden ${className}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-100/80 px-2 py-0.5 rounded-full border border-brand-200">
            {current.badgeText || (current.isSponsored ? 'Reklama' : 'Tavsiya')}
          </span>
          <span className="text-[11px] text-gray-600 font-medium">{current.sponsorName}</span>
        </div>

        <h4 className="font-bold text-gray-900 text-sm mb-1">{current.title}</h4>
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">{current.subtitle}</p>

        {current.actionUrl?.startsWith('http') ? (
          <a
            href={current.actionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
          >
            {current.actionText} <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <Link
            to={current.actionUrl || '#'}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition"
          >
            {current.actionText} <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    );
  }

  // ── Footer Wide Strip ──
  return (
    <div className={`rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-none">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {current.badgeText || 'Hamkorlik'}
            </span>
            <span className="text-xs text-gray-600">• {current.sponsorName}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">{current.title}</p>
          <p className="text-xs text-gray-600">{current.subtitle}</p>
        </div>
      </div>

      <Link
        to={current.actionUrl || '#'}
        className="flex-none px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-xs transition"
      >
        {current.actionText}
      </Link>
    </div>
  );
};
