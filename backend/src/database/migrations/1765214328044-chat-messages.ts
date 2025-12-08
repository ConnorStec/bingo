import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatMessages1765214328044 implements MigrationInterface {
    name = 'ChatMessages1765214328044'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roomId" uuid NOT NULL, "playerId" uuid NOT NULL, "playerName" character varying NOT NULL, "message" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9fa0373c1451ad384fc6a74aa8" ON "chat_messages" ("roomId") `);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_9fa0373c1451ad384fc6a74aa8c" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_1ab91df986dd66ff806d7579ac7" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_1ab91df986dd66ff806d7579ac7"`);
        await queryRunner.query(`ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_9fa0373c1451ad384fc6a74aa8c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9fa0373c1451ad384fc6a74aa8"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
    }

}
