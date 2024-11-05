import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function printRoutes(server: any) {
  // Get the routes map
  const router = server._router;
  const availableRoutes = router.stack
    .filter((r) => r.route)
    .map((r) => {
      return {
        route: {
          path: r.route.path,
          method: r.route.stack[0].method,
        },
      };
    });

  // Print the routes
  console.table(availableRoutes.map((r) => r));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const server = app.getHttpAdapter().getInstance();
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'), configService.get('HOST'), () => {
    printRoutes(server);
  });
}
bootstrap().then(() => {
  console.log('Server is running on http://localhost:3000');
});
