import { Injectable } from '@nestjs/common';
import { Donation, Stats } from '@prisma/client';
import { RafflesService } from 'src/raffles/raffles.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DonationsService {
  constructor(
    private prisma: PrismaService,
    private raffleService: RafflesService,
  ) {}

  async findAll(): Promise<Donation[] | null> {
    const donations = await this.prisma.donation.findMany({
      orderBy: [
        {
          timestamp: 'desc',
        },
      ],
      include: {
        raffle: {
          select: {
            winner: true,
          },
        },
      },
    });

    return donations;
  }

  createStats(
    currentAmount: number,
    noOfDonations: number,
    title: string,
    goal: number,
  ) {
    return this.prisma.stats.create({
      data: {
        amount: currentAmount,
        noOfDonations,
        title,
        goal,
      },
    });
  }

  async updateStats(amount: number, noOfDonations: number) {
    const current = await this.stats();
    return this.prisma.stats.update({
      where: { id: current.id },
      data: { amount, noOfDonations },
    });
  }

  stats(): Promise<Stats | null> {
    return this.prisma.stats.findFirst();
  }

  async createMany(donations: Donation[]) {
    const inserted = await this.prisma.$transaction(
      donations.map((donation) =>
        this.prisma.donation.create({ data: donation }),
      ),
    );
    await this.raffleService.checkRaffleNew(inserted);
  }

  async createManyWithUpdate(donations: Donation[]) {
    const hashes = donations.map((d) => d.hash);
    const currentDonations = await this.prisma.donation.findMany({
      where: {
        hash: { in: hashes },
      },
    });
    const currentDonationHashes = currentDonations.map((d) => d.hash);

    const donationsToCreate = donations.filter(
      (d) => !currentDonationHashes.includes(d.hash),
    );

    const inserted = await this.prisma.$transaction(
      donationsToCreate.map((donation) =>
        this.prisma.donation.create({ data: donation }),
      ),
    );
    await this.raffleService.checkRaffle(inserted);
  }
}
