import type { IReviewService } from '@/services/interfaces';
import type { Review, ReviewCriterion } from '@/types';
import { MOCK_REVIEWS, REVIEW_TEMPLATES } from './mockData';
import { _tickets } from './appointmentService';
import { timeService } from './timeService';
import { featureFlags } from './adminService';

const MIN_REVIEWS_FOR_VISIBILITY = 10;
let reviews: Review[] = [...MOCK_REVIEWS];

class MockReviewService implements IReviewService {
  async submitReview(params: {
    ticketId: string;
    doctorId: string;
    scores: Record<ReviewCriterion, number>;
    templateKey: string;
  }): Promise<Review> {
    await delay(500);

    const ticket = _tickets.find(t => t.id === params.ticketId);
    if (!ticket) throw new Error('review.ticketNotFound');
    if (ticket.status !== 'completed') throw new Error('review.notCompleted');

    const existing = reviews.find(r => r.ticketId === params.ticketId);
    if (existing) throw new Error('review.alreadySubmitted');

    const review: Review = {
      id: `rv-${timeService.now().getTime()}`,
      ticketId: params.ticketId,
      doctorId: params.doctorId,
      scores: params.scores,
      templateKey: params.templateKey,
      createdAt: timeService.now().toISOString(),
    };
    reviews.push(review);
    return review;
  }

  async getDoctorRating(doctorId: string): Promise<{ visible: boolean; avgOverall?: number; count: number }> {
    await delay(200);
    const doctorReviews = reviews.filter(r => r.doctorId === doctorId);
    const count = doctorReviews.length;
    const flags = await featureFlags();
    const visible = count >= MIN_REVIEWS_FOR_VISIBILITY && flags.publicRatings;

    if (!visible) return { visible, count };

    const avg = (key: ReviewCriterion) =>
      doctorReviews.reduce((s, r) => s + r.scores[key], 0) / count;

    const avgOverall = (avg('punctuality') + avg('explanation') + avg('communication')) / 3;
    return { visible, avgOverall: Math.round(avgOverall * 10) / 10, count };
  }

  async getReviewTemplates() {
    return REVIEW_TEMPLATES;
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const reviewService: IReviewService = new MockReviewService();
