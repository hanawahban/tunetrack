import { Module } from '@nestjs/common';
import { ScrobblesController } from './scrobbles.controller';
import { ScrobblesService } from './scrobbles.service';

@Module({
  controllers: [ScrobblesController],
  providers: [ScrobblesService],
})
export class ScrobblesModule {}
