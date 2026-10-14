import { describe, it, expect } from 'vitest';
import { applicationService } from '../services/applicationService';

describe('Application Service & Conversion Metrics', () => {
  it('calculates conversion metrics correctly without dividing by zero', () => {
    // Empty state test
    const emptyMetrics = applicationService.calculateMetrics([]);
    expect(emptyMetrics.total).toBe(0);
    expect(emptyMetrics.interviewRate).toBe(0);
    expect(emptyMetrics.offerRate).toBe(0);
    expect(emptyMetrics.followUpsNeeded).toEqual([]);

    // Populated state test
    const sampleApps = [
      { id: '1', status: 'Applied', follow_up_date: '2026-04-10' },
      { id: '2', status: 'Assessment' },
      { id: '3', status: 'Interview', follow_up_date: new Date().toISOString().split('T')[0] },
      { id: '4', status: 'Offer' },
      { id: '5', status: 'Rejected' },
      { id: '6', status: 'Saved' }, // Not submitted yet
    ];

    const metrics = applicationService.calculateMetrics(sampleApps);
    expect(metrics.total).toBe(6);
    expect(metrics.byStatus.Applied).toBe(1);
    expect(metrics.byStatus.Assessment).toBe(1);
    expect(metrics.byStatus.Interview).toBe(1);
    expect(metrics.byStatus.Offer).toBe(1);
    expect(metrics.byStatus.Rejected).toBe(1);
    expect(metrics.byStatus.Saved).toBe(1);

    // Active apps = total (6) - Saved (1) = 5
    // Interviews = Interview (1) + Offer (1) = 2
    // Interview rate = (2 / 5) * 100 = 40%
    expect(metrics.interviewRate).toBe(40);

    // Offer rate = (1 / 2) * 100 = 50%
    expect(metrics.offerRate).toBe(50);

    // Follow-up due within 3 days
    expect(metrics.followUpsNeeded.length).toBeGreaterThan(0);
  });
});
