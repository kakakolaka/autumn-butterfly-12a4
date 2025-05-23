// mysql2 v3.13.0 or later is required
import { createConnection  } from 'mysql2/promise';

export interface Env {
  // If you set another name in the Wrangler config file as the value for 'binding',
  // replace "HYPERDRIVE" with the variable name you defined.
  HYPERDRIVE: Hyperdrive;
}

export default {
 async fetch(request, env, ctx): Promise<Response> {

    // Create a connection using the mysql2 driver (or any support driver, ORM or query builder)
    // with the Hyperdrive credentials. These credentials are only accessible from your Worker.
    const connection = await createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      port: env.DB_PORT

      // The following line is needed for mysql2 compatibility with Workers
      // mysql2 uses eval() to optimize result parsing for rows with > 100 columns
      // Configure mysql2 to use static parsing instead of eval() parsing with disableEval
      disableEval: true
    });

    try{
      // Sample query
      const [results, fields] = await connection.query(
        'SHOW tables;'
      );

      // Clean up the client after the response is returned, before the Worker is killed
      ctx.waitUntil(connection.end());

      // Return result rows as JSON
      return new Response(JSON.stringify({ results, fields }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    catch(e){
      console.error(e);
      return Response.json(
        { error: e instanceof Error ? e.message : e },
        { status: 500 },
      );
    }

 },
} satisfies ExportedHandler<Env>;
