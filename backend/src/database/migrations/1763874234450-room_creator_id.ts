import { MigrationInterface, QueryRunner } from "typeorm";

export class RoomCreatorId1763874234450 implements MigrationInterface {
    name = 'RoomCreatorId1763874234450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "creatorId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" ALTER COLUMN "creatorId" SET NOT NULL`);
    }

}
