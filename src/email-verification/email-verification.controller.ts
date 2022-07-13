import { Controller, Param, Get } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EmailTokenDto } from './dto/email-token.dto';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificatioService: EmailVerificationService,
  ) {}

  @Get('/:token')
  async verifyEmail(@Param() emailTokenDto: EmailTokenDto) {
    return await this.emailVerificatioService.decodeEmailToken(
      emailTokenDto.token,
    );
  }
}
