import { ReservationsProcessor } from './reservations.processor';
import { ReservationStatus } from '@prisma/client';
import { Job } from 'bullmq';

describe('ReservationsProcessor.process', () => {
  let processor: ReservationsProcessor;
  let mockConcertService: {
    findOne: jest.Mock;
    updateSeat: jest.Mock;
  };
  let mockReservationsService: {
    updateStatus: jest.Mock;
  };

  beforeEach(() => {
    mockConcertService = {
      findOne: jest.fn(),
      updateSeat: jest.fn(),
    };

    mockReservationsService = {
      updateStatus: jest.fn(),
    };

    processor = new ReservationsProcessor(
      mockConcertService as any,
      mockReservationsService as any,
    );
  });

  it('should mark reservation as RESERVED when seats are available', async () => {
    mockConcertService.findOne.mockResolvedValue({ seatsAvailable: 5 });

    const job = {
      name: 'reserve-seat',
      data: { concertId: 'concert-1', reservationId: 'res-1' },
    } as unknown as Job<any>;

    await expect(processor.process(job)).resolves.toBe(true);

    expect(mockConcertService.findOne).toHaveBeenCalledWith('concert-1');
    expect(mockReservationsService.updateStatus).toHaveBeenCalledWith({
      id: 'res-1',
      status: ReservationStatus.RESERVED,
    });
    expect(mockConcertService.updateSeat).toHaveBeenCalled();
  });

  it('should mark reservation as SOLD_OUT when no seats are available', async () => {
    mockConcertService.findOne.mockResolvedValue({ seatsAvailable: 0 });

    const job = {
      name: 'reserve-seat',
      data: { concertId: 'concert-2', reservationId: 'res-2' },
    } as unknown as Job<any>;

    await expect(processor.process(job)).resolves.toBe(true);

    expect(mockConcertService.findOne).toHaveBeenCalledWith('concert-2');
    expect(mockReservationsService.updateStatus).toHaveBeenCalledWith({
      id: 'res-2',
      status: ReservationStatus.SOLD_OUT,
    });
  });

  it('should mark reservation as CANCELLED on cancel-seat job', async () => {
    const job = {
      name: 'cancel-seat',
      data: { reservationId: 'res-3' },
    } as unknown as Job<any>;

    await expect(processor.process(job)).resolves.toBe(true);

    expect(mockReservationsService.updateStatus).toHaveBeenCalledWith({
      id: 'res-3',
      status: 'CANCELLED',
    });
    expect(mockConcertService.updateSeat).toHaveBeenCalled();
  });

  it('should return true and do nothing for unknown job names', async () => {
    const job = {
      name: 'unknown-job',
      data: {},
    } as unknown as Job<any>;

    await expect(processor.process(job)).resolves.toBe(true);

    expect(mockConcertService.findOne).not.toHaveBeenCalled();
    expect(mockReservationsService.updateStatus).not.toHaveBeenCalled();
    expect(mockConcertService.updateSeat).not.toHaveBeenCalled();
  });
});
