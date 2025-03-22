export function up(knex) {
  return knex.schema.createTable("logs", (table) => {
    table.uuid("log_id").primary();
    table.string("title").notNullable();
    table.string("cover_image").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("logs");
}
