import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Donation } from '@prisma/client';

const LIMIT = 5;

@Injectable()
export class JarsService {
  constructor(private readonly httpService: HttpService) {}

  private getHash(input: string): number {
    const normal = input.toLocaleLowerCase?.().replace(/\s/g, '');
    let hash = 0;
    const len = normal.length;

    for (let i = 0; i < len; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0; // to 32bit integer
    }

    return hash;
  }

  private async findDonationsByPage(page: number): Promise<Donation[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Donation[]>(
        `https://bossan.musikhjalpen.se/server/fundraisers/donations/2F7CfTMN4LUlTWmHJXlOfx/${page}`,
      ),
    );

    const donations = data.map((d) => ({
      ...d,
      hash: Math.abs(this.getHash(`${d.timestamp} ${d.name} ${d.amount}`)),
    }));

    return donations;
  }

  async findDonationsBetween(
    oldNoOfDonations: number,
    newNoOfDonations: number,
  ) {
    const oldPages = Math.ceil(oldNoOfDonations / LIMIT);
    const newPages = Math.ceil(newNoOfDonations / LIMIT);
    const diff = newPages - oldPages;
    // Since the new donations is at page 0, we fetch a couple of extra so we don't miss anything
    const pages = 2 + diff;

    const donations = (
      await Promise.all(
        Array.from({ length: pages }, async (_, i) => {
          const page = LIMIT * i;
          return this.findDonationsByPage(page);
        }),
      )
    ).flatMap((d) => d);

    return donations;
  }

  async findAllDonations(numberOfDonations: number) {
    const pages = Math.ceil(numberOfDonations / LIMIT);
    const donations = (
      await Promise.all(
        Array.from({ length: pages }, async (_, i) => {
          const page = LIMIT * i;
          return this.findDonationsByPage(page);
        }),
      )
    ).flatMap((d) => d);

    return donations;
  }

  async findStats() {
    const noOfDonations = await this.findNoOfDonations();
    const jarStats = await this.findJarStats();
    const jarContent = await this.findJarContent();

    return {
      amount: jarStats?.amount,
      noOfDonations: noOfDonations,
      title: jarContent?.result?.data?.contentfulFundraiser?.title,
      goal: jarContent?.result?.data?.contentfulFundraiser?.goal ?? 30_000,
    };
  }

  private async findNoOfDonations() {
    const { data } = await firstValueFrom(
      this.httpService.get<number>(
        'https://bossan.musikhjalpen.se/server/fundraisers/donations/2F7CfTMN4LUlTWmHJXlOfx/number-of-donations',
      ),
    );

    return data;
  }

  private async findJarStats() {
    const { data } = await firstValueFrom(
      this.httpService.get<any>(
        'https://bossan.musikhjalpen.se/server/fundraisers/2F7CfTMN4LUlTWmHJXlOfx?fields[]=amount&fields=prev_amount',
      ),
    );
    return data;
  }

  private async findJarContent() {
    const { data } = await firstValueFrom(
      this.httpService.get<any>(
        'https://bossan.musikhjalpen.se/page-data/mpyahjaelpen/page-data.json',
      ),
    );
    return data;
  }
}
