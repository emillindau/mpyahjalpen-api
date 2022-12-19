import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DonationsService } from 'src/donations/donations.service';
import { JarsService } from 'src/jars/jars.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly jarsService: JarsService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    const prevStats = await this.donationsService.stats();
    const { noOfDonations: prevNoOfDonations } = prevStats ?? {};
    const stats = await this.jarsService.findStats();
    const { noOfDonations: currentNoOfDonations, amount, title, goal } = stats;

    if (!prevNoOfDonations) {
      await this.donationsService.createStats(
        amount,
        currentNoOfDonations,
        title,
        goal,
      );

      const donations = await this.jarsService.findAllDonations(
        currentNoOfDonations,
      );

      await this.donationsService.createMany(donations);
    } else {
      if (currentNoOfDonations > prevNoOfDonations) {
        const donations = await this.jarsService.findDonationsBetween(
          prevNoOfDonations,
          currentNoOfDonations,
        );

        await this.donationsService.createManyWithUpdate(donations);
        await this.donationsService.updateStats(amount, currentNoOfDonations);
      }
    }
  }
}
