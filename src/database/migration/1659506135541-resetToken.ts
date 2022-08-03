import { MigrationInterface, QueryRunner } from 'typeorm';

export class resetToken1659506135541 implements MigrationInterface {
  name = 'migration1659506135541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetToken" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_fc4e2400c1740f58b41ff4f5ec6" UNIQUE ("resetToken")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_fc4e2400c1740f58b41ff4f5ec6"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetToken"`);
  }
}
