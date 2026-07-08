import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AlbumsModule } from './albums/albums.module';
import { ArtistsModule } from './artists/artists.module';
import { TracksModule } from './tracks/tracks.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ScrobblesModule } from './scrobbles/scrobbles.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    PrismaModule,
    AlbumsModule,
    ArtistsModule,
    TracksModule,
    UsersModule,
    AuthModule,
    ScrobblesModule,
    StatsModule,
  ],
})
export class AppModule {}
