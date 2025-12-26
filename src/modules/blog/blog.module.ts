import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { PackagesController, PostsController } from './blog.controller';
import { SupabaseModule } from 'src/services/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [BlogService],
  controllers: [PackagesController, PostsController],
  exports: [BlogService],
})
export class BlogModule {}

