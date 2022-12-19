import { Injectable } from '@nestjs/common';
import { Donation, Raffle } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

type RaffleMap = Record<string, Raffle>;

@Injectable()
export class RafflesService {
  constructor(private prisma: PrismaService) {}

  private raffle() {
    const max = 20;
    const min = 0;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    return rand >= 18;
  }

  private async findStickers() {
    let stickers = await this.prisma.stickers.findFirst();

    if (!stickers) {
      stickers = await this.prisma.stickers.create({
        data: {
          amount: 50,
        },
      });
    }

    return stickers;
  }

  private async createMany(
    insertArray: Omit<Raffle, 'id'>[],
    newStickersLeft: number,
    id: number,
  ) {
    await this.prisma.raffle.createMany({
      data: insertArray,
      skipDuplicates: true,
    });

    await this.prisma.stickers.update({
      where: { id },
      data: { amount: newStickersLeft },
    });
  }

  private findAll() {
    return this.prisma.raffle.findMany();
  }

  async checkRaffleNew(donations: Donation[]) {
    const { amount: stickersLeft, id } = await this.findStickers();
    const hashes = donations.map((d) => d.hash);
    const raffles = await this.prisma.raffle.findMany({
      where: {
        donationId: { in: hashes },
      },
    });
    const rafflesHashes = raffles.map((rh) => rh.donationId);

    const donationsToRaffle = donations.filter(
      (d) => !rafflesHashes.includes(d.hash),
    );

    console.log('donationsToRaffle', donationsToRaffle.length);

    let numberOfWinners = 0;
    const rafflesToInsert = donationsToRaffle
      .map((donation) => {
        if (donation.name) {
          const res = this.raffle();
          if (res) numberOfWinners++;

          return {
            donationId: donation.hash,
            winner: res,
          };
        }
      })
      .filter(Boolean);

    let newStickersLeft = stickersLeft - numberOfWinners;
    if (newStickersLeft < 0) newStickersLeft = 0;

    if (rafflesToInsert.length) {
      this.createMany(rafflesToInsert, newStickersLeft, id);
    }
  }

  async checkRaffle(donations: Donation[]) {
    const { amount: stickersLeft, id } = await this.findStickers();

    if (stickersLeft) {
      let previousRaffles = [];
      try {
        previousRaffles = await this.findAll();
      } catch (e) {}

      const previousRafflesMap = previousRaffles.reduce((acc, curr) => {
        acc[curr.donationId] = curr;
        return acc;
      }, {} as RaffleMap);

      let numberOfWinners = 0;
      const insertArray = [];
      const withRaffle = donations.map((donation) => {
        const hasBeenInRaffle = previousRafflesMap[donation.hash];

        if (!hasBeenInRaffle && donation.name) {
          // Do raffle!
          const res = this.raffle();
          if (res) numberOfWinners++;

          insertArray.push({
            donationId: donation.hash,
            winner: res,
          });

          return { ...donation, hasWonRaffle: res };
        }

        return { ...donation, hasWonRaffle: hasBeenInRaffle?.winner ?? false };
      });

      let newStickersLeft = stickersLeft - numberOfWinners;
      if (newStickersLeft < 0) newStickersLeft = 0;

      if (insertArray.length) {
        this.createMany(insertArray, newStickersLeft, id);
      }

      return withRaffle;
    }

    return donations;
  }
}
