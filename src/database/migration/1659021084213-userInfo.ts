import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1659021084213 implements MigrationInterface {
    name = 'migration1659021084213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "history" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "history"`);
    }

}
