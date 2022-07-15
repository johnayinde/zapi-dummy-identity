import { MigrationInterface, QueryRunner } from "typeorm";

export class EmailVerifyField1657876911506 implements MigrationInterface {
    name = 'EmailVerifyField1657876911506'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isEmailVerified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isEmailVerified"`);
    }

}
