import { MigrationInterface, QueryRunner } from "typeorm";

export class Extensions1763872757971 implements MigrationInterface {
    name = 'Extensions1763872757971'
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
    }

}