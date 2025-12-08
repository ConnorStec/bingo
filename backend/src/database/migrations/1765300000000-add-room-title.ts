import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoomTitle1765300000000 implements MigrationInterface {
    name = 'AddRoomTitle1765300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ADD "title" varchar(255) NOT NULL DEFAULT 'Untitled Room'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "title"`);
    }

}
