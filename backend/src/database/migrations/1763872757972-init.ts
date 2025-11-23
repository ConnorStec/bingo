import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1763872757972 implements MigrationInterface {
    name = 'Init1763872757972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "card_spaces" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "cardId" uuid NOT NULL, "position" integer NOT NULL, "optionText" character varying NOT NULL, "isFreeSpace" boolean NOT NULL DEFAULT false, "isMarked" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_23af908b22c5c1c711e18e84782" UNIQUE ("cardId", "position"), CONSTRAINT "PK_40e44420ed74d6595c2223e60d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c31e23aacc4206620c8f17614a" ON "card_spaces" ("cardId") `);
        await queryRunner.query(`CREATE TABLE "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "playerId" uuid NOT NULL, "roomId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_77cc52eaa57ba2bcfad4561769b" UNIQUE ("playerId"), CONSTRAINT "REL_77cc52eaa57ba2bcfad4561769" UNIQUE ("playerId"), CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1f97a5a23bd99cfa1dd365f967" ON "cards" ("roomId") `);
        await queryRunner.query(`CREATE TABLE "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roomId" uuid NOT NULL, "name" character varying NOT NULL, "sessionToken" character varying NOT NULL, "avatarUrl" character varying, "lastSeen" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e71410d8e6dce971093d4943593" UNIQUE ("sessionToken"), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_280e4c471900ea22801fb3ce58" ON "players" ("roomId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e71410d8e6dce971093d494359" ON "players" ("sessionToken") `);
        await queryRunner.query(`CREATE TYPE "public"."rooms_status_enum" AS ENUM('LOBBY', 'PLAYING', 'FINISHED')`);
        await queryRunner.query(`CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "joinCode" character varying(5) NOT NULL, "creatorId" uuid NOT NULL, "status" "public"."rooms_status_enum" NOT NULL DEFAULT 'LOBBY', "isOpen" boolean NOT NULL DEFAULT true, "optionsPool" text array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "lastActivity" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_27e3bdf239dada29e2f93db47ec" UNIQUE ("joinCode"), CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_27e3bdf239dada29e2f93db47e" ON "rooms" ("joinCode") `);
        await queryRunner.query(`ALTER TABLE "card_spaces" ADD CONSTRAINT "FK_c31e23aacc4206620c8f17614ac" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "FK_77cc52eaa57ba2bcfad4561769b" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cards" ADD CONSTRAINT "FK_1f97a5a23bd99cfa1dd365f9677" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_280e4c471900ea22801fb3ce58c" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_280e4c471900ea22801fb3ce58c"`);
        await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT "FK_1f97a5a23bd99cfa1dd365f9677"`);
        await queryRunner.query(`ALTER TABLE "cards" DROP CONSTRAINT "FK_77cc52eaa57ba2bcfad4561769b"`);
        await queryRunner.query(`ALTER TABLE "card_spaces" DROP CONSTRAINT "FK_c31e23aacc4206620c8f17614ac"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27e3bdf239dada29e2f93db47e"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TYPE "public"."rooms_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e71410d8e6dce971093d494359"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_280e4c471900ea22801fb3ce58"`);
        await queryRunner.query(`DROP TABLE "players"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f97a5a23bd99cfa1dd365f967"`);
        await queryRunner.query(`DROP TABLE "cards"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c31e23aacc4206620c8f17614a"`);
        await queryRunner.query(`DROP TABLE "card_spaces"`);
    }

}
