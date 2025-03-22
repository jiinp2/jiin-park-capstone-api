export function up(knex) {
  return knex.schema.createTable("images", (table) => {
    table.increments("id").primary();
    table.string("file_path").notNullable();
    table.string("file_name").notNullable();
    table.integer("file_size").notNullable();
    table.string("file_type").notNullable();
    table.decimal("latitude", 10, 6);
    table.decimal("longitude", 10, 6);
    table.timestamp("timestamp");
    table
      .uuid("log_id")
      .references("log_id")
      .inTable("logs")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable("images");
}
